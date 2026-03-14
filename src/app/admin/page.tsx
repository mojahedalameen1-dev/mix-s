import { createClient } from "@/lib/supabase/server"
import AdminUsersList from "@/components/AdminUsersList"
import AdminInviteManager from "@/components/AdminInviteManager"
import StatProgress from "@/components/StatProgress"
import { Users, Target, Shield, TrendingUp, UserPlus, Activity, ArrowUpRight, LayoutGrid, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  try {
    const { count: pendingCount, error: pendingError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingError) console.error("Pending count error:", pendingError)

    const { data: teamStats, error: statsError } = await supabase
      .from('deals')
      .select('expected_value, stage')
      .in('stage', ['مغلقة ناجحة', 'won'])
    
    if (statsError) console.error("Stats fetch error:", statsError)

    const totalSales = teamStats?.reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0
    const globalTarget = 1200000 
    const progress = (totalSales / globalTarget) * 100

    return (
      <div className="min-h-screen pb-24 space-y-16">
        {/* High-End Command Header */}
        <header className="relative px-4 pt-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10 blur-3xl opacity-50" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 max-w-[1400px] mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                  <Shield className="w-3 h-3" />
                  مركز القيادة والتحكم
                </div>
                <div className="h-0.5 w-12 bg-zinc-200 dark:bg-zinc-800" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-zinc-900 dark:text-white leading-[0.9]">
                 الإدارة <br />
                 <span className="text-primary italic">العامة للمنصة</span>
              </h1>
              
              <p className="max-w-xl text-zinc-500 font-bold text-lg leading-relaxed">
                تحكم كامل في هوية الفريق، تصاريح الوصول، ومراقبة مسارات النمو الرقمي للمؤسسة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 space-y-4">
                <Zap className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-[10px] font-black text-zinc-400 spacing-widest">تحديثات النظام</p>
                  <p className="text-lg font-black tracking-tight">يعمل الآن</p>
                </div>
              </div>
              <div className="p-8 bg-primary text-white rounded-[40px] shadow-2xl shadow-primary/30 space-y-4 relative overflow-hidden group">
                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                 <Activity className="w-8 h-8" />
                 <div>
                    <p className="text-[10px] font-black text-white/60">بينغ البيانات</p>
                    <p className="text-lg font-black tracking-tight">0.4ms</p>
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* Extreme Stats Hierarchy */}
        <section className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Performance Card */}
          <div className="lg:col-span-8 bg-zinc-900 dark:bg-black rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 h-full items-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.4em]">إجمالي المبيعات المعتمدة</h3>
                  <div className="flex items-baseline gap-4">
                    <span className="text-8xl font-black tracking-tighter">{(totalSales / 1000).toLocaleString()}</span>
                    <span className="text-2xl font-bold opacity-40 uppercase">K.SAR</span>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                      <span>تحقيق الأهداف</span>
                      <span>{progress.toFixed(1)}%</span>
                   </div>
                   <StatProgress progress={progress} />
                </div>
              </div>
              
              <div className="hidden md:flex flex-col items-end gap-6 border-r border-white/10 pr-12">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">المستهدف الشهري</p>
                    <p className="text-4xl font-black">1.2M</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">نسبة النمو</p>
                    <p className="text-4xl font-black text-emerald-400">+14%</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Pending Card */}
          <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900 rounded-[56px] p-12 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between group cursor-pointer hover:border-primary transition-all">
             <div className="space-y-6">
                <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[24px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                   <UserPlus className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter leading-tight text-zinc-900 dark:text-white">
                  طلبات بانتظار <br />
                  الموافقة
                </h3>
             </div>
             <div className="mt-8 flex items-end justify-between">
                <span className="text-8xl font-black text-primary tracking-tighter">{pendingCount || 0}</span>
                <div className="p-4 bg-zinc-900 dark:bg-white rounded-2xl group-hover:translate-x-2 transition-transform">
                   <ArrowUpRight className="w-8 h-8 text-white dark:text-black" />
                </div>
             </div>
          </div>
        </section>

        {/* Unified Management Control */}
        <section className="max-w-[1400px] mx-auto px-4 gap-12 grid grid-cols-1 xl:grid-cols-12">
          <div className="xl:col-span-5 relative">
             <div className="sticky top-10 space-y-8">
                <div className="flex items-center gap-4">
                   <LayoutGrid className="w-6 h-6 text-primary" />
                   <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">إدارة المنافذ</h2>
                </div>
                <AdminInviteManager />
             </div>
          </div>
          
          <div className="xl:col-span-7 space-y-10">
             <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/20" />
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">فريق مطوري الأعمال</h2>
             </div>
             <AdminUsersList />
          </div>
        </section>
      </div>
    )
  } catch (e: any) {
    return (
      <div className="min-h-screen flex items-center justify-center p-20">
        <div className="p-10 bg-red-500/10 border-2 border-red-500 rounded-3xl text-red-500 max-w-2xl w-full">
          <h1 className="text-2xl font-black mb-4">Error Rendering Admin Dashboard</h1>
          <p className="font-bold mb-4">{e.message}</p>
          <pre className="text-xs p-4 bg-black/10 rounded-xl overflow-auto">{e.stack}</pre>
        </div>
      </div>
    )
  }
}
