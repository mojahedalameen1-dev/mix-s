"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on('postgres_changes' as any, { 
        event: 'INSERT', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload: any) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 20))
        setUnreadCount(prev => prev + 1)
        // Optional: show toast
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const markAsRead = async () => {
    if (unreadCount === 0) return
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setUnreadCount(0)
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) markAsRead()
        }}
        className="relative p-3 bg-muted/50 rounded-xl hover:bg-muted transition-all active:scale-95"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 mt-4 w-80 bg-card border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">الإشعارات</h3>
                <span className="text-xs text-muted-foreground">{notifications.length} إشعار</span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <p className="text-sm font-medium">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {/* {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })} */}
                        منذ قليل
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>لا توجد إشعارات حالياً</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-muted/30 text-center">
                <button className="text-xs font-bold text-primary hover:underline">عرض كل الإشعارات</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
