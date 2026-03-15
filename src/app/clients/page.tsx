"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { logActivity } from "@/lib/activity"
import { Client } from "@/types/database"
import { UserPlus, Search, Phone, Building2, MoreVertical } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("engineer")
  const [profile, setProfile] = useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newClient, setNewClient] = useState<Partial<Client>>({
    client_name: "",
    phone: "",
    email: "",
    client_type: "",
    city: "",
  })
  const supabase = createClient()

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (user) {
        // Fetch profile (role + full data for Header)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profileData) {
          setProfile(profileData)
          setUserRole(profileData.role)
        }

        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('engineer_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        if (data) setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...newClient, engineer_id: user.id }])
          .select()
        
        if (error) throw error

        if (data) {
          setClients([data[0], ...clients])
          setIsAddModalOpen(false)
          setNewClient({ client_name: "", phone: "", email: "", client_type: "", city: "" })
          
          // Log activity
          await logActivity(
            supabase, 
            user.id, 
            'client_created', 
            `تمت إضافة عميل جديد: ${newClient.client_name}`,
            { entityType: 'client', entityId: String(data[0].id) }
          )
        }
      }
    } catch (error) {
      console.error("Error adding client:", error)
      alert("حدث خطأ أثناء إضافة العميل")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar role={userRole as any} />
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
        {profile && <Header profile={profile} />}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">العملاء</h1>
            <p className="text-muted-foreground mt-1">إدارة قائمة عملائك وبيانات التواصل</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            إضافة عميل جديد
          </button>
        </div>

        {/* Add Client Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-[32px] p-8 space-y-6 shadow-2xl border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic">إضافة عميل جديد</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">اسم العميل</label>
                  <input 
                    required
                    value={newClient.client_name}
                    onChange={(e) => setNewClient({...newClient, client_name: e.target.value})}
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">رقم الجوال</label>
                    <input 
                      value={newClient.phone || ""}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">البريد الإلكتروني</label>
                    <input 
                      type="email"
                      value={newClient.email || ""}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">نوع العميل</label>
                    <select 
                      value={newClient.client_type || ""}
                      onChange={(e) => setNewClient({...newClient, client_type: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    >
                      <option value="">اختر النوع</option>
                      <option value="شركة">شركة</option>
                      <option value="فرد">فرد</option>
                      <option value="جهة حكومية">جهة حكومية</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">المدينة</label>
                    <input 
                      value={newClient.city || ""}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "جاري الإضافة..." : "حفظ العميل"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="بحث عن عميل..." 
                className="w-full bg-muted/50 border-none rounded-xl py-2 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <table className="w-full text-right">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-sm">
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">الشركة</th>
                <th className="p-4 font-medium">التواصل</th>
                <th className="p-4 font-medium">تاريخ الإضافة</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{client.client_name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {client.client_type || client.city || "—"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-primary" />
                        {client.phone || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground uppercase">
                    {new Date(client.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4 text-left">
                    <button className="p-2 hover:bg-muted rounded-lg">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    لا يوجد عملاء مضافين حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
