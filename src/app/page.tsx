import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardContent from "@/components/DashboardContent"
import PendingApproval from "@/components/PendingApproval"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <div className="text-center space-y-4 p-8 border rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold text-destructive">خطأ في تهيئة الحساب</h1>
          <p>لم يتم العثور على ملف شخصي لهذا الحساب. يرجى التواصل مع المسؤول.</p>
          <p className="text-xs text-muted-foreground font-mono">User ID: {user.id}</p>
        </div>
      </div>
    )
  }

  if (profile.status === 'pending') {
    return <PendingApproval />
  }

  if (profile.status === 'deactivated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <div className="text-center space-y-4 p-8 border rounded-2xl">
          <h1 className="text-2xl font-bold text-destructive">تم تعطيل الحساب</h1>
          <p>يرجى التواصل مع الإدارة لمزيد من المعلومات.</p>
        </div>
      </div>
    )
  }

  return <DashboardContent profile={profile} />
}
