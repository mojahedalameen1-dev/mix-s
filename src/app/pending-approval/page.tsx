import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-2 border-indigo-500/20 p-12 rounded-[48px] shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-[28px] flex items-center justify-center mx-auto text-indigo-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">بانتظار الموافقة</h1>
          <p className="text-zinc-500 font-bold leading-relaxed">
            تم تسجيل حسابك بنجاح. حسابك حالياً قيد المراجعة من قبل الإدارة. سيتم تفعيل حسابك بمجرد الموافقة عليه.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login" className="flex items-center justify-center gap-3 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:opacity-90">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}
