"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Client } from "@/types/database"
import { UserPlus, Search, Phone, Mail, Building2, MoreVertical } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('engineer_id', user.id)
          .order('created_at', { ascending: false })
        
        if (data) setClients(data)
      }
      setLoading(false)
    }

    fetchClients()
  }, [])

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
                    <div className="font-bold">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {client.company || "—"}
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
