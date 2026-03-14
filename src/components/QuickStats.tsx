"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile, Deal, Client } from "@/types/database"
import { TrendingUp, Users, Target, Banknote } from "lucide-react"

export default function QuickStats({ profile }: { profile: Profile }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    closedDeals: 0,
    totalClients: 0,
    targetProgress: 0
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      // Current month stats
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      
      const { data: deals } = await supabase
        .from('deals')
        .select('expected_value, stage')
        .eq('engineer_id', profile.id)
        .gte('created_at', firstDayOfMonth)

      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('engineer_id', profile.id)

      const totalSales = deals?.filter(d => d.stage === 'مغلقة ناجحة' || d.stage === 'won').reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0
      const closedDeals = deals?.filter(d => d.stage === 'مغلقة ناجحة' || d.stage === 'won').length || 0
      const targetProgress = profile.monthly_target > 0 ? (totalSales / profile.monthly_target) * 100 : 0

      setStats({
        totalSales,
        closedDeals,
        totalClients: clientsCount || 0,
        targetProgress
      })
    }

    fetchStats()
    fetchStats()
  }, [profile.id, profile.monthly_target, supabase])

  const cards = [
    { label: "إجمالي المبيعات", value: `${stats.totalSales.toLocaleString()} ر.س`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "صفقات مغلقة", value: stats.closedDeals, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "عدد العملاء", value: stats.totalClients, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "تحقيق التارقت", value: `${Math.round(stats.targetProgress)}%`, icon: Target, color: "text-primary", bg: "bg-primary/10", progress: stats.targetProgress },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="p-6 bg-card border rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">{card.value}</h3>
          </div>
          {card.progress !== undefined && (
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${Math.min(card.progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
