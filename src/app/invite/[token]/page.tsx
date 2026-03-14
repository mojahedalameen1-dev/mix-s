import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { ShieldAlert, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  const now = new Date().toISOString()
  
  console.log(`[Invite] Verifying token: ${params.token} at ${now}`)

  // Verify invite token with robust checks
  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('*')
    .eq('token', params.token)
    .eq('is_active', true)
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
            <p className="text-zinc-500 font-bold leading-relaxed">يبدو أن رابط الدعوة هذا قد انتهى أو أنك أدخلت رمزاً غير صحيح.</p>
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

  // Record usage (optional, but good for tracking)
  await supabase
    .from('invite_links')
    .update({ usage_count: (invite.usage_count || 0) + 1 })
    .eq('id', invite.id)

  console.log(`[Invite] Token valid, setting cookie and redirecting to login...`)
  
  // Set a secure cookie with the invitation token
  const cookieStore = cookies()
  cookieStore.set('sb-invite-token', params.token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax'
  })
  
  // If token is valid, redirect to login
  redirect('/login')
}
