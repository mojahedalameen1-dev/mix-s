import { createClient } from "@/lib/supabase/server"
import AdminUsersList from "@/components/AdminUsersList"
import AdminInviteManager from "@/components/AdminInviteManager"
import { Users, Target } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = createClient()
  
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: teamStats } = await supabase
    .from('deals')
    .select('expected_value, stage')
    .in('stage', ['مغلقة ناجحة', 'won'])

  const totalSales = teamStats?.reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0
  const globalTarget = 1200000 // 1.2M as in the design
  const progress = (totalSales / globalTarget) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black">لوحة التحكم للإدارة</h1>
        <p className="text-muted-foreground mt-2 text-lg">إشراف كامل على أداء الفريق وإعدادات المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-primary text-primary-foreground rounded-3xl shadow-xl space-y-4">
          <Users className="w-10 h-10 opacity-50" />
          <h3 className="text-2xl font-bold">طلبات الانضمام</h3>
          <p className="text-5xl font-black">{pendingCount || 0}</p>
          <p className="text-sm opacity-80">بانتظار الموافقة</p>
        </div>
        
        <AdminInviteManager />

        <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-4">
          <Target className="w-10 h-10 text-primary opacity-50" />
          <h3 className="text-2xl font-bold">التارقت العام</h3>
          <p className="text-4xl font-black">{ (totalSales / 1000000).toFixed(1) }M <span className="text-sm font-normal">ر.س</span></p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">المستهدف: 1.2M ر.س</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">إدارة الفريق</h2>
        <AdminUsersList />
      </div>
    </div>
  )
}
