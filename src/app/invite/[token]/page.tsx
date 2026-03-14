import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  
  // Verify invite token
  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('*')
    .eq('token', params.token)
    .eq('is_active', true)
    .single()

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
        <div className="text-center space-y-4 p-8 border rounded-2xl">
          <h1 className="text-2xl font-bold text-destructive">عذراً، الرابط غير صالح</h1>
          <p>يبدو أن رابط الدعوة هذا قد انتهى أو أنه غير موجود.</p>
        </div>
      </div>
    )
  }

  // If token is valid, redirect to login
  // The middleware/auth flow will handle the rest
  redirect('/login')
}
