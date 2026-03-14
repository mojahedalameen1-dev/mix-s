"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { UserCheck, UserMinus, Edit3, Trash2, Mail, Briefcase, Target, Shield, Users, ArrowUpRight, CheckCircle2, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminUsersList() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [supabase])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('status', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'active' : 'pending'
    await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    fetchUsers()
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded-[32px]" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">قائمة المطورين</h3>
        <span className="text-[10px] font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
          إجمالي الأعضاء: {users.length}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {users.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-zinc-50 dark:bg-zinc-900 shadow-inner rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col items-center gap-4 opacity-20">
                <Users className="w-20 h-20" />
                <p className="text-2xl font-black italic">لا يوجد مطورون نشطون حالياً</p>
              </div>
            </div>
          ) : (
            users.map((user, index) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[36px] hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src={user.avatar_url || ""} 
                      className="w-20 h-20 rounded-[28px] object-cover shadow-2xl border-4 border-zinc-50 dark:border-zinc-800 group-hover:scale-105 transition-transform" 
                      alt={user.full_name || "User Avatar"} 
                    />
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-4 border-white dark:border-zinc-900 ${
                      user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                      {user.status === 'active' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{user.full_name}</h4>
                       {user.role === 'admin' && <Shield className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-zinc-400 font-bold flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                      {user.job_title || "مطور أعمال"}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-primary text-[10px] font-black border border-primary/10">
                        {user.monthly_target?.toLocaleString() || 0} ر.س / شهرياً
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => toggleStatus(user.id, user.status)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      user.status === 'pending' 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-110" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
                    }`}
                    title={user.status === 'pending' ? "تفعيل الآن" : "تعطيل مؤقت"}
                  >
                    {user.status === 'pending' ? <UserCheck className="w-6 h-6" /> : <UserMinus className="w-6 h-6" />}
                  </button>

                  <button className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 transition-all opacity-0 group-hover:opacity-100">
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
