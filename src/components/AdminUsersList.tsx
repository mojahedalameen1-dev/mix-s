"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { UserCheck, UserMinus, Edit3, Trash2, Mail, Briefcase, Target, Shield, Users } from "lucide-react"
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
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-3xl" />
      ))}
    </div>
  )

  return (
    <div className="bg-card/30 backdrop-blur-xl border-2 border-primary/5 rounded-[32px] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-primary/5 border-b-2 border-primary/5 text-muted-foreground">
              <th className="px-8 py-6 font-black text-sm uppercase tracking-widest">المطور</th>
              <th className="px-8 py-6 font-black text-sm uppercase tracking-widest">المنصب</th>
              <th className="px-8 py-6 font-black text-sm uppercase tracking-widest">التارقت</th>
              <th className="px-8 py-6 font-black text-sm uppercase tracking-widest">الحالة</th>
              <th className="px-8 py-6 font-black text-sm uppercase tracking-widest">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-primary/5">
            <AnimatePresence>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Users className="w-16 h-16" />
                      <p className="text-xl font-bold italic">لا يوجد مطورون في النظام حالياً</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-primary/5 transition-all group"
                  >
                    <td className="p-8 flex items-center gap-5">
                      <div className="relative">
                        <img 
                          src={user.avatar_url || ""} 
                          className="w-16 h-16 rounded-[20px] object-cover shadow-lg border-2 border-white/10" 
                          alt={user.full_name || "User Avatar"} 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-card ${
                          user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-lg tracking-tight">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="flex items-center gap-2 font-bold text-sm bg-muted/50 w-fit px-4 py-2 rounded-xl border border-primary/5">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {user.job_title || "فني مبيعات"}
                      </span>
                    </td>
                    <td className="p-8">
                      <div className="space-y-2 w-32">
                        <p className="font-black text-lg text-primary">{user.monthly_target?.toLocaleString() || 0} <span className="text-[10px] opacity-70">ر.س</span></p>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 w-2/3" />
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        user.status === 'active' 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {user.status === 'active' ? 'نشط الآن' : 'في الانتظار'}
                      </span>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={`p-3 rounded-2xl transition-all shadow-sm ${
                            user.status === 'pending' 
                              ? "bg-emerald-500 text-white hover:shadow-emerald-500/20" 
                              : "bg-amber-500 text-white hover:shadow-amber-500/20"
                          }`}
                          title={user.status === 'pending' ? "تفعيل الحساب" : "تعطيل الحساب"}
                        >
                          {user.status === 'pending' ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
                        </button>
                        
                        <button className="p-3 bg-muted/50 rounded-2xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        
                        <button className="p-3 bg-destructive/5 rounded-2xl hover:bg-destructive/10 transition-all text-destructive opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
