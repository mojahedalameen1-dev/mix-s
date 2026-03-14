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
      <div className="min-h-screen pb-24 space-y-20 relative overflow-hidden bg-slate-50/50">
        {/* Subtle background elements for light theme */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Command Header - Light Theme */}
        <header className="relative pt-16 px-4">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-white border border-slate-200 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 shadow-sm">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  بروتوكول التحكم المركزي
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase italic">
                  Command <br />
                  <span className="text-primary not-italic">Center</span>
                </h1>
                <p className="max-w-xl text-slate-500 font-bold text-xl leading-relaxed pr-2 border-r-2 border-primary/20">
                  واجهة إدارة الموارد المتقدمة. تحكم في تدفق البيانات، صلاحيات المستخدمين، ومراقبة الأداء الختامي للمنشأة.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="glass-card p-8 rounded-[40px] bg-white/80 border-slate-200 space-y-6 min-w-[200px] group transition-all hover:border-primary/40">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حالة النظام</p>
                  <p className="text-xl font-black text-slate-900 italic">OPERATIONAL</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-[40px] bg-white/80 border-slate-200 space-y-6 min-w-[200px] group transition-all hover:border-emerald-500/40">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-sm group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">زمن الاستجابة</p>
                  <p className="text-xl font-black text-emerald-600 italic">0.4 <span className="text-[10px] opacity-60 text-slate-400">ms</span></p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Extreme Stats Hierarchy - Light Theme */}
        <section className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Performance Card */}
          <div className="lg:col-span-8 glass-card rounded-[64px] p-12 bg-white/90 border-slate-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 h-full items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">إجمالي المبيعات المعتمدة</h3>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[120px] font-black tracking-tighter leading-none pr-2 text-slate-900">{(totalSales / 1000).toLocaleString()}</span>
                    <span className="text-3xl font-black text-slate-300 uppercase italic">K.SAR</span>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>النمو المستهدف</span>
                      <span className="text-primary">{progress.toFixed(1)}%</span>
                   </div>
                   <StatProgress progress={progress} />
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-12 border-r border-slate-100 pr-12 lg:pr-20 font-arabic">
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المستهدف السنوي</p>
                    <p className="text-5xl font-black italic text-slate-900">1.2<span className="text-2xl ml-1 text-slate-300">M</span></p>
                 </div>
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معدل التحويل</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <p className="text-5xl font-black text-emerald-600 italic leading-none">+14%</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Pending Card - Light Theme */}
          <div className="lg:col-span-4 glass-card rounded-[64px] p-12 bg-white/90 border-slate-200 flex flex-col justify-between group cursor-pointer hover:border-primary/40 transition-all duration-700 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] -z-10 group-hover:scale-150 transition-transform" />
             
             <div className="space-y-8">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-900 rounded-[32px] flex items-center justify-center shadow-sm group-hover:shadow-primary/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                   <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-5xl font-black tracking-tighter leading-[0.9] text-slate-900 italic">
                    PENDING <br />
                    <span className="text-slate-300 group-hover:text-slate-500 transition-colors">REQUESTS</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">طلبات انضمام الفريق</p>
                </div>
             </div>
             <div className="mt-12 flex items-center justify-between">
                <span className="text-9xl font-black text-primary tracking-tighter leading-none">{pendingCount || 0}</span>
                <div className="p-5 bg-slate-900 text-white rounded-3xl group-hover:-translate-y-4 group-hover:-translate-x-4 transition-all duration-500 shadow-xl">
                   <ArrowUpRight className="w-10 h-10" />
                </div>
             </div>
          </div>
        </section>

        {/* Unified Management Control - Light Theme */}
        <section className="max-w-[1400px] mx-auto px-4 gap-16 grid grid-cols-1 xl:grid-cols-12 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden xl:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

          <div className="xl:col-span-5 relative">
             <div className="sticky top-10 space-y-12">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                      <LayoutGrid className="w-6 h-6 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Access Portals</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إدارة منافذ الدخول والروابط</p>
                      </div>
                   </div>
                </div>
                <AdminInviteManager />
             </div>
          </div>
          
          <div className="xl:col-span-7 space-y-12 pr-0 xl:pr-12">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                      <Users className="w-6 h-6 text-slate-500" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Agent Network</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l border-primary/40 leading-none">فريق مطوري الأعمال النشطين</p>
                   </div>
                </div>
                <button className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest transition-all shadow-sm">
                  عرض الكل
                </button>
             </div>
             
             <div className="glass-card rounded-[48px] p-2 bg-white/50 border-slate-100">
                <AdminUsersList />
             </div>
          </div>
        </section>
      </div>
    )
  } catch (e: any) {
    return (
      <div className="min-h-screen flex items-center justify-center p-20 bg-black">
        <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-[40px] text-red-500 max-w-2xl w-full backdrop-blur-3xl">
          <h1 className="text-2xl font-black mb-4 flex items-center gap-3">
             <Shield className="w-8 h-8" />
             CRITICAL SYSTEM ERROR
          </h1>
          <p className="font-bold mb-4 opacity-80">{e.message}</p>
          <pre className="text-[10px] p-6 bg-black/40 rounded-2xl overflow-auto border border-white/5 font-mono">{e.stack}</pre>
        </div>
      </div>
    )
  }
}
