import { createClient } from "@/lib/supabase/server"
import AdminUsersList from "@/components/AdminUsersList"
import AdminInviteManager from "@/components/AdminInviteManager"
import StatProgress from "@/components/StatProgress"
import { Users, Target, Shield, TrendingUp, UserPlus, Activity, ArrowUpRight, LayoutGrid, Zap } from "lucide-react"
import { motion } from "framer-motion"

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
      <div className="min-h-screen pb-24 space-y-20 relative overflow-hidden bg-[#020202]">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] -z-10 animate-float" />

        {/* High-End Command Header */}
        <header className="relative pt-16 px-4">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 shadow-2xl">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  بروتوكول التحكم المركزي
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase italic">
                  Command <br />
                  <span className="text-primary not-italic">Center</span>
                </h1>
                <p className="max-w-xl text-zinc-500 font-bold text-xl leading-relaxed pr-2 border-r-2 border-primary/20">
                  واجهة إدارة الموارد المتقدمة. تحكم في تدفق البيانات، صلاحيات المستخدمين، ومراقبة الأداء الختامي للمنشأة.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="glass-card p-8 rounded-[40px] border-white/5 space-y-6 min-w-[200px] group transition-all hover:border-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">حالة النظام</p>
                  <p className="text-xl font-black text-white italic">OPERATIONAL</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-[40px] border-white/5 space-y-6 min-w-[200px] group transition-all hover:border-emerald-500/20">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">زمن الاستجابة</p>
                  <p className="text-xl font-black text-emerald-400 italic">0.4 <span className="text-[10px] opacity-60">ms</span></p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Extreme Stats Hierarchy */}
        <section className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Performance Card */}
          <div className="lg:col-span-8 glass-card rounded-[64px] p-12 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-full h-full noise-bg opacity-[0.03] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 h-full items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">إجمالي المبيعات المعتمدة</h3>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[120px] font-black tracking-tighter leading-none pr-2">{(totalSales / 1000).toLocaleString()}</span>
                    <span className="text-3xl font-black opacity-30 uppercase italic">K.SAR</span>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      <span>النمو المستهدف</span>
                      <span className="text-primary">{progress.toFixed(1)}%</span>
                   </div>
                   <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full premium-gradient rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)]" 
                      />
                   </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-12 border-r border-white/5 pr-12 lg:pr-20">
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">المستهدف السنوي</p>
                    <p className="text-5xl font-black italic">1.2<span className="text-2xl ml-1 text-zinc-700">M</span></p>
                 </div>
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">معدل التحويل</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <p className="text-5xl font-black text-emerald-400 italic leading-none">+14%</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Pending Card */}
          <div className="lg:col-span-4 glass-card rounded-[64px] p-12 border-white/5 flex flex-col justify-between group cursor-pointer hover:border-primary/40 transition-all duration-700 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -z-10 group-hover:scale-150 transition-transform" />
             
             <div className="space-y-8">
                <div className="w-20 h-20 bg-zinc-900 border border-white/5 text-white rounded-[32px] flex items-center justify-center shadow-2xl group-hover:shadow-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                   <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-5xl font-black tracking-tighter leading-[0.9] text-white italic">
                    PENDING <br />
                    <span className="text-zinc-600 group-hover:text-zinc-200 transition-colors">REQUESTS</span>
                  </h3>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">طلبات انضمام الفريق</p>
                </div>
             </div>
             <div className="mt-12 flex items-center justify-between">
                <span className="text-9xl font-black text-primary tracking-tighter leading-none">{pendingCount || 0}</span>
                <div className="p-5 bg-white text-black rounded-3xl group-hover:-translate-y-4 group-hover:-translate-x-4 transition-all duration-500 shadow-2xl">
                   <ArrowUpRight className="w-10 h-10" />
                </div>
             </div>
          </div>
        </section>

        {/* Unified Management Control */}
        <section className="max-w-[1400px] mx-auto px-4 gap-16 grid grid-cols-1 xl:grid-cols-12 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden xl:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />

          <div className="xl:col-span-5 relative">
             <div className="sticky top-10 space-y-12">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                      <LayoutGrid className="w-6 h-6 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter text-white italic uppercase">Access Portals</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">إدارة منافذ الدخول والروابط</p>
                      </div>
                   </div>
                </div>
                <AdminInviteManager />
             </div>
          </div>
          
          <div className="xl:col-span-7 space-y-12 pr-0 xl:pr-12">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Users className="w-6 h-6 text-zinc-400" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter text-white italic uppercase">Agent Network</h2>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-2 border-l border-primary/40 leading-none">فريق مطوري الأعمال النشطين</p>
                   </div>
                </div>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                  عرض الكل
                </button>
             </div>
             
             <div className="glass-card rounded-[48px] p-2 border-white/5">
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
