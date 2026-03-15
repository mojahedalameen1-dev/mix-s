"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, ArrowRight, CheckCircle2 } from "lucide-react"
import { logActivity } from "@/lib/activity"

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      setSession(session)
      // Pre-fill from Google metadata if available
      const googleName = session.user.user_metadata?.full_name
      if (googleName) setFullName(googleName)
    }
    getSession()
  }, [supabase, router])

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !session) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          has_seen_welcome: true
        })
        .eq('id', session.user.id)

      if (error) throw error

      await logActivity(supabase, session.user.id, 'profile_completed', 'إكمال الملف الشخصي وتعيين الاسم')

      router.push("/")
    } catch (error) {
      console.error("Error completing profile:", error)
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[48px] p-12 shadow-2xl border-2 border-primary/5 space-y-10 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto border border-primary/20">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">أهلاً بك في MIX-S</h1>
          <p className="text-slate-500 font-bold text-lg">خطوة واحدة أخيرة لتفعيل حسابك بالكامل</p>
        </div>

        <form onSubmit={handleComplete} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الثلاثي المعتمد</label>
            <div className="relative group">
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل هنا..."
                className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-primary/40 focus:bg-white transition-all font-bold outline-none text-slate-900"
                required
              />
              <CheckCircle2 className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-all ${fullName.length > 3 ? 'text-emerald-500 opacity-100' : 'text-slate-200 opacity-50'}`} />
            </div>
            <p className="text-[10px] text-slate-400 mr-2">سيتم استخدام هذا الاسم في العروض الفنية والمالية التي تقوم بإنشائها.</p>
          </div>

          <button 
            type="submit"
            disabled={loading || fullName.length < 3}
            className="w-full py-6 premium-gradient text-white rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>تأكيد والبدء الآن</span>
                <ArrowRight className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
