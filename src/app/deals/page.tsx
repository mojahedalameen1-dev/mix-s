"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { logActivity } from "@/lib/activity"
import { Deal } from "@/types/database"
import { Plus, Calendar, Tag, ArrowRightLeft, Briefcase } from "lucide-react"
import Sidebar from "@/components/Sidebar"

const STATUS_MAP = {
  new: { label: "جديدة", color: "bg-blue-500/10 text-blue-500" },
  in_progress: { label: "قيد التفاوض", color: "bg-amber-500/10 text-amber-500" },
  won: { label: "مغلقة ناجحة", color: "bg-emerald-500/10 text-emerald-500" },
  lost: { label: "مغلقة خاسرة", color: "bg-rose-500/10 text-rose-500" }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("engineer")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    deal_name: "",
    expected_value: 0,
    stage: "new",
    client_id: 0,
  })
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      if (user) {
        // Fetch user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role) setUserRole(profile.role)

        // Fetch clients for the dropdown
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, client_name')
          .eq('engineer_id', user.id)
        if (clientsData) setClients(clientsData)

        // Fetch deals
        const { data, error } = await supabase
          .from('deals')
          .select('*, clients(client_name)')
          .eq('engineer_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        if (data) setDeals(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('deals')
          .insert([{ 
            ...newDeal, 
            engineer_id: user.id,
            expected_value: Number(newDeal.expected_value)
          }])
          .select('*, clients(client_name)')
        
        if (error) throw error
        
        if (data) {
          setDeals([data[0], ...deals])
          setIsAddModalOpen(false)
          setNewDeal({ deal_name: "", expected_value: 0, stage: "new", client_id: 0 })
          
          // Log activity
          await logActivity(
            supabase, 
            user.id, 
            'sale_created', 
            `تمت إضافة صفقة جديدة: ${newDeal.deal_name} بقيمة ${newDeal.expected_value} ر.س`,
            { entityType: 'deal', entityId: String(data[0].id) }
          )
        }
      }
    } catch (error) {
      console.error("Error adding deal:", error)
      alert("حدث خطأ أثناء إضافة الصفقة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar role={userRole as any} />
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الصفقات</h1>
            <p className="text-muted-foreground mt-1">تتبع مسار مبيعاتك وأدائك التجاري</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            صفقة جديدة
          </button>
        </div>

        {/* Add Deal Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-card w-full max-w-lg rounded-[32px] p-8 space-y-6 shadow-2xl border">
              <h2 className="text-2xl font-black italic">إضافة صفقة جديدة</h2>

              <form onSubmit={handleAddDeal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">اسم الصفقة</label>
                  <input 
                    required
                    value={newDeal.deal_name}
                    onChange={(e) => setNewDeal({...newDeal, deal_name: e.target.value})}
                    placeholder="مثال: توريد أجهزة لشركة X"
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">العميل</label>
                  <select 
                    required
                    value={newDeal.client_id || ""}
                    onChange={(e) => setNewDeal({...newDeal, client_id: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  >
                    <option value="">اختر العميل</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.client_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">القيمة المتوقعة (ر.س)</label>
                    <input 
                      type="number"
                      required
                      value={newDeal.expected_value}
                      onChange={(e) => setNewDeal({...newDeal, expected_value: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">المرحلة الحالية</label>
                    <select 
                      value={newDeal.stage || "new"}
                      onChange={(e) => setNewDeal({...newDeal, stage: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    >
                      {Object.entries(STATUS_MAP).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? "جاري الحفظ..." : "إضافة الصفقة"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-bold active:scale-[0.98] transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals.map((deal: any) => (
            <div key={deal.id} className="p-6 bg-card border rounded-3xl space-y-4 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_MAP[deal.stage as keyof typeof STATUS_MAP]?.color || "bg-muted"}`}>
                  {STATUS_MAP[deal.stage as keyof typeof STATUS_MAP]?.label || deal.stage}
                </span>
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold line-clamp-1">{deal.deal_name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  {deal.clients?.client_name || "بدون عميل"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dashed">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">القيمة المتوقعة</p>
                  <p className="text-lg font-black text-primary">{deal.expected_value?.toLocaleString()} ر.س</p>
                </div>
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-right">المتابعة القادمة</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-3 h-3" />
                    {deal.next_followup_date ? new Date(deal.next_followup_date).toLocaleDateString('ar-EG') : "غير محدد"}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {deals.length === 0 && !loading && (
            <div className="col-span-full p-20 text-center space-y-4 border-2 border-dashed rounded-3xl bg-muted/20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">لا توجد صفقات بعد</h3>
              <p className="text-muted-foreground">ابدأ بإضافة أول صفقة لك لتبدأ تتبع مبيعاتك</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
