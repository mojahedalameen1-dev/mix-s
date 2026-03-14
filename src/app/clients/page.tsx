"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Client } from "@/types/database"
import { UserPlus, Search, Phone, Mail, Building2, MoreVertical } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchClients = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (user) {
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

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar role="engineer" /> {/* Role should be dynamic preferably from context */}
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">العملاء</h1>
            <p className="text-muted-foreground mt-1">إدارة قائمة عملائك وبيانات التواصل</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">
            <UserPlus className="w-5 h-5" />
            إضافة عميل جديد
          </button>
        </div>

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
