'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Activity, User, Briefcase, TrendingUp, LogIn, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BDActivityLogProps {
  userId: string
}

type ActivityLog = {
  id: string
  action_type: string
  description: string
  created_at: string
  metadata: any
}

export default function BDActivityLog({ userId }: BDActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
  }, [userId])

  async function fetchActivities() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

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
      case 'login': return <LogIn className="w-5 h-5" />
      case 'client_created': return <User className="w-5 h-5" />
      case 'sale_created': return <TrendingUp className="w-5 h-5" />
      case 'meeting_created': return <Briefcase className="w-5 h-5" />
      case 'profile_completed': return <CheckCircle2 className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'client_created': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'sale_created': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'meeting_created': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'profile_completed': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="relative font-arabic" dir="rtl">
      {activities.length > 0 ? (
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-6">
              {/* Timeline Connector */}
              {index !== activities.length - 1 && (
                <div className="absolute top-12 bottom-[-24px] right-[23px] w-px bg-slate-100" />
              )}
              
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform hover:scale-110 ${getBadgeColor(activity.action_type)}`}>
                {getIcon(activity.action_type)}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ar })}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">
                    {new Date(activity.created_at).toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all">
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 text-slate-400 uppercase">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 italic">لا يوجد نشاط مسجل لهذا المطور</p>
        </div>
      )}
    </div>
  )
}
