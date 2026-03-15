import { createAdminClient } from "@/lib/supabase/admin"
import AdminUsersList from "@/components/AdminUsersList"
import AdminInviteManager from "@/components/AdminInviteManager"
import RecentActivityFeed from "@/components/RecentActivityFeed"
import StatProgress from "@/components/StatProgress"
import { Users, Target, Shield, TrendingUp, UserPlus, Activity, ArrowUpRight, LayoutGrid, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("تنبيه: مفتاح SUPABASE_SERVICE_ROLE_KEY غير موجود في متغيرات البيئة. يرجى إضافته في Vercel.")
  }

  const supabase = createAdminClient()
  
  try {
    // 1. Business Developers Count
    const { count: bdCount, error: bdCountError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'business_developer')
      .eq('status', 'active')
    
    if (bdCountError) console.error('Error fetching BD count:', bdCountError)

    // 2. Total Clients Count
    const { count: clientsCount, error: clientsCountError } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
    
    if (clientsCountError) console.error('Error fetching clients count:', clientsCountError)

    // 3. Sales & Revenue this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { data: monthDeals, error: monthDealsError } = await supabase
      .from('deals')
      .select('expected_value, stage')
      .gte('created_at', startOfMonth.toISOString())

    if (monthDealsError) console.error('Error fetching month deals:', monthDealsError)

    const monthSalesCount = monthDeals?.length || 0
    const monthRevenue = monthDeals
      ?.filter(d => ['مغلقة ناجحة', 'won'].includes(d.stage || ''))
      .reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0

    // Global stats (all time)
    const { data: allWonDeals, error: allWonDealsError } = await supabase
      .from('deals')
      .select('expected_value')
      .in('stage', ['مغلقة ناجحة', 'won'])
    
    if (allWonDealsError) console.error('Error fetching all won deals:', allWonDealsError)
    
    const totalSales = allWonDeals?.reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0
    const globalTarget = 1200000 
    const progress = (totalSales / globalTarget) * 100

    // 4. Fetch initial child component data
    const [invitesRes, bdsRes, activitiesRes] = await Promise.all([
      supabase.from('invite_links').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'business_developer').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(50)
    ])

    const initialInvites = invitesRes.data || []
    const bds = bdsRes.data || []
    const initialActivities = activitiesRes.data || []

    if (invitesRes.error) console.error('Error fetching initial invites:', invitesRes.error)
    if (bdsRes.error) console.error('Error fetching business developers:', bdsRes.error)
    if (activitiesRes.error) console.error('Error fetching activities:', activitiesRes.error)

    // Calculate stats for initialUsers
    const initialUsers = bds.length > 0 ? await Promise.all(bds.map(async (bd) => {
      const [cRes, dRes, lRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('engineer_id', bd.id),
        supabase.from('deals').select('expected_value, stage').eq('engineer_id', bd.id),
        supabase.from('activity_logs').select('created_at').eq('user_id', bd.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ])

      const revenue = dRes.data
        ?.filter((d: any) => ['مغلقة ناجحة', 'won'].includes(d.stage || ''))
        .reduce((acc: number, d: any) => acc + (Number(d.expected_value) || 0), 0) || 0

      return {
        ...bd,
        clients_count: cRes.count || 0,
        deals_count: dRes.data?.length || 0,
        total_revenue: revenue,
        last_activity: lRes.data?.created_at
      }
    })) : []

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
                  <p className="text-xl font-black text-emerald-600 italic">0.4 <span className="text-[10px] ml-1">MS</span></p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Extreme Stats Hierarchy - Section A */}
        <section className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 flex flex-col justify-between group hover:border-primary/40 transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 italic">LIVE</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المطورين النشطين</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900">{bdCount || 0}</span>
                   <span className="text-xs font-bold text-slate-300 italic uppercase">Agents</span>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 flex flex-col justify-between group hover:border-primary/40 transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                   <Shield className="w-6 h-6" />
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي العملاء</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900">{clientsCount || 0}</span>
                   <span className="text-xs font-bold text-slate-300 italic uppercase">Clients</span>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 flex flex-col justify-between group hover:border-primary/40 transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                   <TrendingUp className="w-6 h-6" />
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مبيعات الشهر</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-slate-900">{monthSalesCount}</span>
                   <span className="text-xs font-bold text-slate-300 italic uppercase">Deals</span>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                   <ArrowUpRight className="w-6 h-6" />
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إيرادات الشهر</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-emerald-600">{(monthRevenue / 1000).toFixed(1)}K</span>
                   <span className="text-xs font-bold text-slate-300 italic uppercase">SAR</span>
                </div>
             </div>
          </div>
        </section>

        {/* Sales Progress Section */}
        <section className="max-w-[1400px] mx-auto px-4">
          <div className="glass-card rounded-[64px] p-12 bg-white/90 border-slate-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 h-full items-center text-slate-900">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">مؤشر المبيعات الكلية المعتمدة</h3>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[120px] font-black tracking-tighter leading-none pr-2">{(totalSales / 1000).toLocaleString()}</span>
                    <span className="text-3xl font-black text-slate-300 uppercase italic">K.SAR</span>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>التقدم نحو المليون الأول</span>
                      <span className="text-primary">{progress.toFixed(1)}%</span>
                   </div>
                   <StatProgress progress={progress} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-12 border-r border-slate-100 pr-12 lg:pr-20 font-arabic">
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المستهدف السنوي</p>
                    <p className="text-5xl font-black italic">1.2<span className="text-2xl ml-1 text-slate-300">M</span></p>
                 </div>
                 <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توقعات النمو</p>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                       <p className="text-5xl font-black text-emerald-600 italic leading-none">+18%</p>
                    </div>
                 </div>
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
                <AdminInviteManager initialLinks={initialInvites || []} />
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
             </div>
             
             <div className="glass-card rounded-[48px] p-2 bg-white/50 border-slate-100">
                <AdminUsersList initialUsers={initialUsers} />
             </div>
          </div>
        </section>

        {/* Recent Activity Feed - Section D */}
        <section className="max-w-[1400px] mx-auto px-4">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-500">
                 <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Operational Feed</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l border-primary/40 leading-none">سجل النشاط المباشر للنظام</p>
              </div>
           </div>
           
           <div className="glass-card rounded-[48px] p-8 bg-white border-slate-100">
              <RecentActivityFeed initialActivities={initialActivities || []} />
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
