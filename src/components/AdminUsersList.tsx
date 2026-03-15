"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { Search, ChevronDown, User, Mail, Calendar, Briefcase, TrendingUp, Users, ArrowUpRight, CheckCircle2, Clock, MoreVertical, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface BDStats extends Profile {
  clients_count: number
  deals_count: number
  total_revenue: number
  last_activity?: string
}

export default function AdminUsersList({ initialUsers = [] }: { initialUsers?: BDStats[] }) {
  const [users, setUsers] = useState<BDStats[]>(initialUsers)
  const [loading, setLoading] = useState(initialUsers.length === 0)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'clients'>('revenue')
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch BD profiles
      const { data: bds, error: bdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'business_developer')
        .order('created_at', { ascending: false })
      
      if (bdError) throw bdError
      if (!bds) return

      // Fetch stats for each BD
      const usersWithStats = await Promise.all(bds.map(async (bd) => {
        const { count: clientCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('engineer_id', bd.id)

        const { data: deals } = await supabase
          .from('deals')
          .select('expected_value, stage')
          .eq('engineer_id', bd.id)

        const revenue = deals
          ?.filter(d => ['مغلقة ناجحة', 'won'].includes(d.stage || ''))
          .reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0

        // Get last log activity
        const { data: lastLog } = await supabase
          .from('activity_logs')
          .select('created_at')
          .eq('user_id', bd.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        return {
          ...bd,
          clients_count: clientCount || 0,
          deals_count: deals?.length || 0,
          total_revenue: revenue,
          last_activity: lastLog?.created_at
        }
      }))

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers()
    }
  }, [fetchUsers, initialUsers.length])

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => 
        (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
         u.email?.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'revenue') return b.total_revenue - a.total_revenue
        if (sortBy === 'clients') return b.clients_count - a.clients_count
        return (a.full_name || '').localeCompare(b.full_name || '')
      })
  }, [users, search, sortBy])

  if (loading) return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
      ))}
    </div>
  )

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 p-4">
        <div className="relative flex-1 group">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-primary transition-colors" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن مطور أعمال باسمه أو بريده..."
            className="w-full pr-14 pl-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all font-bold"
          />
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ترتيب حسب:</span>
           <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-xs cursor-pointer focus:bg-white"
           >
              <option value="revenue">الإيرادات المحققة</option>
              <option value="clients">عدد العملاء</option>
              <option value="name">الاسم الأبجدي</option>
           </select>
        </div>
      </div>

      {/* Table Interface */}
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="pr-8 text-right pb-4">البيانات الأساسية</th>
              <th className="text-center pb-4">المحفظة</th>
              <th className="text-center pb-4">المبيعات</th>
              <th className="text-center pb-4">الإيرادات</th>
              <th className="text-center pb-4">نشاط أخير</th>
              <th className="text-center pb-4">الحالة</th>
              <th className="pl-8 pb-4"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Users className="w-20 h-20" />
                      <p className="text-2xl font-black italic">لا يوجد مطورون يطابقون بحثك</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <td className="bg-white border-y border-r border-slate-100 rounded-r-[32px] p-4 pr-8 transition-all group-hover:border-primary/20 shadow-sm">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 font-black text-xl text-primary group-hover:scale-105 transition-transform">
                             {user.full_name?.[0] || 'م'}
                          </div>
                          <div>
                             <h4 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{user.full_name}</h4>
                             <p className="text-[11px] font-bold text-slate-400 uppercase">{user.email}</p>
                          </div>
                       </div>
                    </td>

                    <td className="bg-white border-y border-slate-100 p-4 text-center shadow-sm">
                       <div className="inline-flex flex-col items-center">
                          <span className="text-lg font-black text-slate-900">{user.clients_count}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">عملاء</span>
                       </div>
                    </td>

                    <td className="bg-white border-y border-slate-100 p-4 text-center shadow-sm">
                       <div className="inline-flex flex-col items-center">
                          <span className="text-lg font-black text-slate-900">{user.deals_count}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">صفقات</span>
                       </div>
                    </td>

                    <td className="bg-white border-y border-slate-100 p-4 text-center shadow-sm">
                       <div className="inline-flex py-1.5 px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <span className="text-sm font-black">{Number(user.total_revenue).toLocaleString()}</span>
                          <span className="text-[8px] mr-1 self-end font-bold opacity-60">ر.س</span>
                       </div>
                    </td>

                    <td className="bg-white border-y border-slate-100 p-4 text-center shadow-sm">
                       <span className="text-[10px] font-bold text-slate-400">
                          {user.last_activity ? new Date(user.last_activity).toLocaleDateString("ar-SA") : '—'}
                       </span>
                    </td>

                    <td className="bg-white border-y border-slate-100 p-4 text-center shadow-sm">
                        <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black border ${
                           user.status === 'active' 
                           ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                           : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                           {user.status === 'active' ? 'نشط' : 'قيد الانتظار'}
                        </div>
                    </td>

                    <td className="bg-white border-y border-l border-slate-100 rounded-l-[32px] p-4 pl-8 shadow-sm">
                       <Link 
                          href={`/admin/bd/${user.id}`}
                          className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                       >
                          <ArrowUpRight className="w-5 h-5" />
                       </Link>
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
