import { createClient } from "@/lib/supabase/server"
import AdminUsersList from "@/components/AdminUsersList"
import { Users, Link as LinkIcon, Target } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = createClient()
  
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: stats } = await supabase
    .rpc('get_team_stats') // I might need to create this RPC or just do client side

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
          <button className="w-full py-3 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-all text-sm">
            عرض الطلبات
          </button>
        </div>
        
        <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-4">
          <LinkIcon className="w-10 h-10 text-primary opacity-50" />
          <h3 className="text-2xl font-bold">رابط الدعوة</h3>
          <p className="text-xs text-muted-foreground break-all">mix-aa.vercel.app/invite/dynamic-token</p>
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all text-sm">
            نسخ الرابط
          </button>
        </div>

        <div className="p-8 bg-card border rounded-3xl shadow-sm space-y-4">
          <Target className="w-10 h-10 text-primary opacity-50" />
          <h3 className="text-2xl font-bold">التارقت العام</h3>
          <p className="text-4xl font-black">1.2M <span className="text-sm font-normal">ر.س</span></p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/2" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">إدارة الفريق</h2>
        <AdminUsersList />
      </div>
    </div>
  )
}
