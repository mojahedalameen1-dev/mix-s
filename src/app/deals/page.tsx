"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Deal } from "@/types/database"
import { Plus, Search, Calendar, Tag, ArrowRightLeft, Briefcase } from "lucide-react"
import Sidebar from "@/components/Sidebar"

const STATUS_MAP = {
  new: { label: "جديدة", color: "bg-blue-500/10 text-blue-500" },
  in_progress: { label: "قيد التفاوض", color: "bg-amber-500/10 text-amber-500" },
  won: { label: "مغلقة ناجحة", color: "bg-emerald-500/10 text-emerald-500" },
  lost: { label: "مغلقة خاسرة", color: "bg-rose-500/10 text-rose-500" }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchDeals = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      if (user) {
        const { data, error } = await supabase
          .from('deals')
          .select('*, clients(client_name)')
          .eq('engineer_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        if (data) setDeals(data)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar role="engineer" />
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الصفقات</h1>
            <p className="text-muted-foreground mt-1">تتبع مسار مبيعاتك وأدائك التجاري</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            صفقة جديدة
          </button>
        </div>

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
