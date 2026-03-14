import { createClient } from "@/lib/supabase/server"
import AdminUsersList from "@/components/AdminUsersList"
import AdminInviteManager from "@/components/AdminInviteManager"
import { Users, Target, Shield, TrendingUp, UserPlus, Activity, ArrowUpRight } from "lucide-react"

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
  const globalTarget = 1200000 
  const progress = (totalSales / globalTarget) * 100

  return (
    <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary animate-in fade-in slide-in-from-right duration-700">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em] opacity-70">إدارة النظام المركزية</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter animate-in fade-in slide-in-from-right duration-1000">
            لوحة <span className="bg-clip-text text-transparent bg-gradient-to-l from-primary via-blue-400 to-indigo-500">القيادة</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl opacity-80">
            تحكم كامل في صلاحيات المطورين، روابط الانتساب، ومراقبة الأداء العام للمنصة.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-card border-2 border-primary/10 rounded-3xl shadow-xl flex items-center gap-4 group hover:border-primary/30 transition-all">
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase opacity-60">حالة النظام</p>
              <p className="text-sm font-black">يعمل بكفاءة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {/* Pending Requests Card */}
        <div className="group relative overflow-hidden p-10 bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground rounded-[40px] shadow-2xl shadow-primary/20 transition-all hover:-translate-y-2">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                <UserPlus className="w-8 h-8" />
              </div>
              <ArrowUpRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black opacity-90">طلبات الانضمام</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black tracking-tighter">{pendingCount || 0}</span>
                <span className="text-sm font-bold opacity-70">بانتظار الموافقة</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="w-full py-3 bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest text-center backdrop-blur-md hover:bg-white/30 transition-all cursor-pointer">
                عرض كل الطلبات
              </div>
            </div>
          </div>
        </div>

        {/* Sales Performance Card */}
        <div className="group relative overflow-hidden p-10 bg-card border-2 border-primary/5 rounded-[40px] shadow-xl hover:border-primary/20 transition-all hover:-translate-y-2">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-primary/10 rounded-3xl">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">+12% هذا الشهر</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">إجمالي المبيعات</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black tracking-tighter">{(totalSales / 1000).toLocaleString()}K</span>
                <span className="text-sm font-bold text-muted-foreground uppercase">ر.س</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase">
                <span className="opacity-60">التقدم نحو التارقت</span>
                <span className="text-primary font-bold">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 shadow-sm" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick System Stats */}
        <div className="p-10 bg-card border-2 border-primary/5 rounded-[40px] shadow-xl space-y-8">
          <div className="p-4 bg-muted/50 rounded-3xl w-fit">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black italic">نظرة سريعة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">التارقت العام</p>
                <p className="text-lg font-black">1.2M ر.س</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">نسبة الإغلاق</p>
                <p className="text-lg font-black">68%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Management Tools Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-4">
        <div className="xl:col-span-4 space-y-6">
          <AdminInviteManager />
        </div>
        
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-3xl font-black tracking-tight">إدارة مطوري الأعمال</h2>
          </div>
          <AdminUsersList />
        </div>
      </div>
    </div>
  )
}
