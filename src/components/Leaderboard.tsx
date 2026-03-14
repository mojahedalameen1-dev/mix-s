"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          monthly_target,
          deals (value, status)
        `)
        .eq('status', 'active')

      if (profiles) {
        const processed = profiles.map(p => {
          const sales = p.deals
            ?.filter((d: any) => d.status === 'won')
            .reduce((acc: number, d: any) => acc + (d.value || 0), 0) || 0
          
          return {
            id: p.id,
            name: p.full_name,
            avatar: p.avatar_url,
            sales,
            progress: p.monthly_target > 0 ? (sales / p.monthly_target) * 100 : 0
          }
        }).sort((a, b) => b.sales - a.sales)

        setLeaders(processed)
      }
    }

    fetchLeaders()

    // Subscribe to deals for realtime updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', table: 'deals' }, () => {
        fetchLeaders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">المتصدرين هذا الشهر</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">بث مباشر</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {leaders.map((leader, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={leader.id} 
              className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-2xl transition-all"
            >
              <div className="relative">
                <img 
                  src={leader.avatar || "/default-avatar.png"} 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-background shadow-sm"
                  alt="" 
                />
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 p-1 rounded-full shadow-lg">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{leader.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(leader.progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{Math.round(leader.progress)}%</span>
                </div>
              </div>

              <div className="text-left">
                <p className="font-bold text-primary">{leader.sales.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ر.س</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
