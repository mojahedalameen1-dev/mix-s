'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/activity'
import { Deal } from '@/types/database'
import { TrendingUp, Calendar, Target, Clock, ArrowRight, RefreshCcw } from 'lucide-react'

interface BDSalesListProps {
  userId: string
}

export default function BDSalesList({ userId }: BDSalesListProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchDeals()
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('engineer_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setDeals(data as Deal[])
      }
    } catch (err) {
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateDealStage(dealId: number, currentStage: string | null) {
    const nextStage = currentStage === 'new' ? 'in_progress' : 
                      currentStage === 'in_progress' ? 'won' : 'new'
    
    setUpdatingId(dealId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('deals')
        .update({ stage: nextStage })
        .eq('id', dealId)

      if (error) throw error

      await logActivity(
        supabase, 
        user.id, 
        'sale_updated', 
        `تم تحديث حالة الصفقة إلى: ${nextStage}`,
        { entityType: 'deal', entityId: String(dealId), metadata: { nextStage } }
      )
      
      await fetchDeals()
    } catch (err) {
      console.error('Error updating deal:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStageColor = (stage: string | null) => {
    const s = stage?.toLowerCase() || ''
    if (s.includes('مغلقة ناجحة') || s === 'won') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    if (s.includes('مغلقة خاسرة') || s === 'lost') return 'bg-red-50 text-red-600 border-red-100'
    if (s.includes('مفاوضات') || s.includes('negotiation') || s === 'in_progress') return 'bg-indigo-50 text-indigo-600 border-indigo-100'
    return 'bg-amber-50 text-amber-600 border-amber-100'
  }

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="font-arabic" dir="rtl">
      {deals.length > 0 ? (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="group p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{deal.deal_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`${getStageColor(deal.stage)} inline-flex px-3 py-1 rounded-full text-[9px] font-black border`}>
                        {deal.stage === 'won' ? 'مغلقة ناجحة' : deal.stage === 'in_progress' ? 'قيد التفاوض' : 'جديدة'}
                      </div>
                      <button 
                        onClick={() => updateDealStage(deal.id, deal.stage)}
                        disabled={updatingId === deal.id}
                        className="p-1 px-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1"
                      >
                        {updatingId === deal.id ? <RefreshCcw className="w-2.5 h-2.5 animate-spin" /> : <RefreshCcw className="w-2.5 h-2.5" />}
                        تحديث المرحلة
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 text-right">
                  <div className="min-w-[100px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">القيمة المتوقعة</p>
                    <div className="flex items-baseline gap-1 text-2xl font-black text-slate-900">
                      <span>{Number(deal.expected_value).toLocaleString()}</span>
                      <span className="text-xs text-slate-300">SAR</span>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-slate-200 hidden md:block" />

                  <div className="min-w-[60px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الدفعة</p>
                    <div className="flex items-baseline gap-1 text-xl font-black text-emerald-600">
                      <span>{deal.payment_percentage || 0}%</span>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-slate-200 hidden md:block" />

                  <div className="min-w-[120px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ المتابعة</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {deal.next_followup_date ? new Date(deal.next_followup_date).toLocaleDateString('ar-SA') : 'لم يحدد'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {deal.ticket_link && (
                     <a 
                       href={deal.ticket_link} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-12 h-12 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all shadow-sm group/link"
                     >
                       <ArrowRight className="w-5 h-5 -rotate-45 group-hover:scale-110 transition-transform" />
                     </a>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100">
          <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 italic">لا توجد صفقات مسجلة حالياً</p>
        </div>
      )}
    </div>
  )
}
