'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Activity, User, Briefcase, TrendingUp, LogIn, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ActivityLog = {
  id: string
  user_id: string
  action_type: string
  description: string
  created_at: string
  profiles: {
    full_name: string
  }
}

export default function RecentActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()

    const channel = supabase
      .channel('activity_logs_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        async (payload) => {
          // Fetch the full record with profile info
          const { data, error } = await supabase
            .from('activity_logs')
            .select(`
              *,
              profiles:user_id (full_name)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setActivities(prev => [data as ActivityLog, ...prev].slice(0, 50))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchActivities() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setActivities(data as ActivityLog[])
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-4 h-4" />
      case 'client_created': return <User className="w-4 h-4" />
      case 'sale_created': return <TrendingUp className="w-4 h-4" />
      case 'meeting_created': return <Briefcase className="w-4 h-4" />
      case 'profile_completed': return <CheckCircle2 className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'client_created': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'sale_created': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'meeting_created': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center border ${getBadgeColor(activity.action_type)} shadow-sm group-hover:scale-110 transition-transform`}>
                  {getIcon(activity.action_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate uppercase">
                      {activity.profiles?.full_name || 'مستخدم غير معروف'}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">لا يوجد نشاط مسجل حالياً</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
