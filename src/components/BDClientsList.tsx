'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/types/database'
import { User, Phone, Mail, MapPin, Briefcase, Calendar } from 'lucide-react'

interface BDClientsListProps {
  userId: string
}

export default function BDClientsList({ userId }: BDClientsListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [userId])

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('engineer_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setClients(data as Client[])
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="font-arabic" dir="rtl">
      {clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="group p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary border border-slate-100 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{client.client_name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.client_type || 'عميل'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {client.phone && (
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-300" />
                    <span dir="ltr">{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-300" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  {client.city || 'غير محدد'}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                  {client.sector || 'قطاع غير محدد'}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400">
                 <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(client.created_at).toLocaleDateString('ar-SA')}
                 </div>
                 <div className="bg-white px-3 py-1 rounded-full border border-slate-100 group-hover:border-primary/20">
                    #{client.id}
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 italic">لا يوجد عملاء مضافين حالياً</p>
        </div>
      )}
    </div>
  )
}
