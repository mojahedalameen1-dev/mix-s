import { createAdminClient } from "@/lib/supabase/admin"
import { ShieldAlert, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LoginButton } from "./login-button"

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  
  console.log(`[Invite] Verifying token: ${params.token} at ${now}`)

  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('*')
    .eq('token', params.token)
    .eq('is_active', true)
    .is('used_at', null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle()

  if (error) {
    console.error("[Invite] Database error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-2 border-red-500/20 p-12 rounded-[48px] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">خطأ في الاتصال</h1>
          <p className="text-zinc-500 font-bold leading-relaxed">حدث خطأ أثناء التحقق من الرابط. يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
      </div>
    )
  }

  if (!invite) {
    console.warn(`[Invite] Invalid or expired token: ${params.token}`)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-2 border-amber-500/20 p-12 rounded-[48px] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/10 rounded-[28px] flex items-center justify-center mx-auto text-amber-500">
            <Clock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">الرابط غير صالح</h1>
            <p className="text-zinc-500 font-bold leading-relaxed tracking-tight">
              يبدو أن رابط الدعوة هذا قد انتهى، أو استُخدم بالفعل، أو أن الرمز غير صحيح.
            </p>
          </div>
          <div className="pt-4">
             <Link href="/login" className="flex items-center justify-center gap-3 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:opacity-90">
                العودة لتسجيل الدخول
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
             </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-2 border-primary/20 p-12 rounded-[48px] shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto text-primary border border-primary/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">دعوة انضمام</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
            تمت دعوتك للانضمام إلى فريق <span className="text-primary">MIX-S</span> كمسؤول مبيعات.
          </p>
        </div>

        <div className="pt-4">
          <LoginButton token={params.token} />
        </div>

        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          بشرط التسجيل باستخدام حساب Google الرسمي
        </p>
      </div>
    </div>
  )
}
