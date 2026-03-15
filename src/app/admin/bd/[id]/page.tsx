import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock,
  ChevronRight,
  Fingerprint,
  Activity
} from "lucide-react"
import Link from "next/link"
import BDActivityLog from "@/components/BDActivityLog"
import BDClientsList from "@/components/BDClientsList"
import BDSalesList from "@/components/BDSalesList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminBDDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!profile) notFound()

  // Fetch stats
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('engineer_id', params.id)

  const { data: deals } = await supabase
    .from('deals')
    .select('expected_value, stage')
    .eq('engineer_id', params.id)

  const revenue = deals
    ?.filter(d => ['مغلقة ناجحة', 'won'].includes(d.stage || ''))
    .reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0

  return (
    <div className="min-h-screen font-arabic" dir="rtl">
      {/* Header / Breadcrumbs */}
      <div className="mb-12 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-primary transition-colors">لوحة التحكم</Link>
            <ChevronRight className="w-3 h-3 rotate-180" />
            <span className="text-slate-900">ملف المطور</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic flex items-center gap-4">
            {profile.full_name}
            <div className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${
               profile.status === 'active' 
               ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
               : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
               {profile.status === 'active' ? 'حساب نشط' : 'قيد المراجعة'}
            </div>
          </h1>
        </div>
        
        <Link 
          href="/admin"
          className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 font-black text-xs hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span>العودة للقائمة</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Profile Card */}
        <section className="glass-card p-8 rounded-[40px] bg-white border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center border-2 border-primary/20 text-3xl font-black text-primary shadow-lg shadow-primary/10 transition-transform">
              {profile.full_name?.[0] || 'م'}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">معلومات الحساب</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile.email}</p>
            </div>

            <div className="w-full h-px bg-slate-50" />

            <div className="grid grid-cols-1 gap-4 w-full text-right">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <Fingerprint className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">المعرف</p>
                  <p className="text-[11px] font-mono font-bold text-slate-900 truncate w-32">{profile.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تاريخ الانضمام</p>
                  <p className="text-xs font-bold text-slate-900">{new Date(profile.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-4">
            <Users className="w-8 h-8 text-indigo-500 mx-auto opacity-40" />
            <div>
              <p className="text-4xl font-black text-slate-900">{clientCount || 0}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي العملاء</p>
            </div>
          </div>
          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-4">
            <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto opacity-40" />
            <div>
              <p className="text-4xl font-black text-slate-900">{deals?.length || 0}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي الصفقات</p>
            </div>
          </div>
          <div className="glass-card p-8 rounded-[40px] bg-white border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-4">
            <TrendingUp className="w-8 h-8 text-primary mx-auto opacity-40" />
            <div>
              <p className="text-3xl font-black text-slate-900">{(revenue / 1000).toFixed(1)}K</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">الإيرادات المحققة (ر.س)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="activity" className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
          <TabsTrigger value="activity" className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
            <Activity className="w-4 h-4 ml-2" />
            سجل النشاط
          </TabsTrigger>
          <TabsTrigger value="clients" className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
            <Users className="w-4 h-4 ml-2" />
            قائمة العملاء
          </TabsTrigger>
          <TabsTrigger value="sales" className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
            <TrendingUp className="w-4 h-4 ml-2" />
            الصفقات والمبيعات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200 shadow-xl shadow-slate-200/50">
            <BDActivityLog userId={params.id} />
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200 shadow-xl shadow-slate-200/50">
            <Suspense fallback={<div className="text-center py-20 font-bold text-slate-400">جاري تحميل قائمة العملاء...</div>}>
              <BDClientsList userId={params.id} />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200 shadow-xl shadow-slate-200/50">
            <Suspense fallback={<div className="text-center py-20 font-bold text-slate-400">جاري تحميل الصفقات...</div>}>
              <BDSalesList userId={params.id} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
