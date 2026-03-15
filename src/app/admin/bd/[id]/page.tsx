import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { User, Mail, Calendar, Briefcase, TrendingUp, Users, ArrowRight, Shield, Activity, DollarSign } from "lucide-react"
import Link from "next/link"
import BDActivityLog from "@/components/BDActivityLog"
import BDClientsList from "@/components/BDClientsList"
import BDSalesList from "@/components/BDSalesList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    id: string
  }
}

export default async function BDDetailPage({ params }: Props) {
  const supabase = createClient()
  const { id } = params

  // Fetch BD profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      invited_by_profile:invited_by (
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    return notFound()
  }

  // Fetch Stats
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('engineer_id', id)

  const { data: deals } = await supabase
    .from('deals')
    .select('expected_value, stage')
    .eq('engineer_id', id)

  const totalRevenue = deals
    ?.filter(d => ['مغلقة ناجحة', 'won'].includes(d.stage || ''))
    .reduce((acc, d) => acc + (Number(d.expected_value) || 0), 0) || 0

  const activeDeals = deals?.filter(d => !['مغلقة ناجحة', 'won', 'lost', 'مغلقة خاسرة'].includes(d.stage || '')).length || 0

  return (
    <div className="min-h-screen pb-24 space-y-12 bg-slate-50/30">
      {/* Header / Profile Info */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            العودة إلى لوحة التحكم
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center border border-primary/20 text-4xl font-black text-primary">
                {profile.full_name?.[0] || 'U'}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                    profile.status === 'active' 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {profile.status === 'active' ? 'نشط' : 'قيد الانتظار'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    انضم في {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                  {profile.invited_by_profile && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      بواسطة: {profile.invited_by_profile.full_name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:min-w-[400px]">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">العملاء</p>
                <p className="text-2xl font-black text-slate-900">{clientCount || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الصفقات</p>
                <p className="text-2xl font-black text-slate-900">{deals?.length || 0}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">الإيرادات</p>
                <p className="text-xl font-black text-emerald-700">{(totalRevenue / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <Tabs defaultValue="activity" className="space-y-8" dir="rtl">
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
            <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200">
              <BDActivityLog userId={id} />
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200">
              <BDClientsList userId={id} />
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="glass-card bg-white p-8 rounded-[40px] border-slate-200">
              <BDSalesList userId={id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
