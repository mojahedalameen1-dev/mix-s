"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { UserCheck, UserMinus, Shield, Edit3, Trash2 } from "lucide-react"

export default function AdminUsersList() {
  const [users, setUsers] = useState<Profile[]>([])
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
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'active' : 'pending'
    await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    fetchUsers()
  }

  return (
    <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-muted/30 text-muted-foreground text-sm">
            <th className="p-6 font-medium">المطور</th>
            <th className="p-6 font-medium">المنصب</th>
            <th className="p-6 font-medium">التارقت الشهري</th>
            <th className="p-6 font-medium">الحالة</th>
            <th className="p-6 font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/10 transition-colors">
              <td className="p-6 flex items-center gap-4">
                <img src={user.avatar_url || ""} className="w-12 h-12 rounded-xl object-cover" alt={user.full_name || "User Avatar"} />
                <div>
                  <p className="font-bold">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </td>
              <td className="p-6 text-sm">
                {user.job_title || "غير محدد"}
              </td>
              <td className="p-6 font-bold text-primary">
                {user.monthly_target?.toLocaleString() || 0} ر.س
              </td>
              <td className="p-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {user.status === 'active' ? 'نشط' : 'قيد الانتظار'}
                </span>
              </td>
              <td className="p-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(user.id, user.status)}
                    className="p-2 hover:bg-muted rounded-lg text-primary"
                  >
                    {user.status === 'pending' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
