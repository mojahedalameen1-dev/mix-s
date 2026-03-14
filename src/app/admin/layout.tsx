import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import AdminGuard from "@/components/AdminGuard"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // We relax the profile.role check to allow access via password gate
  // as per user request for password protection

  return (
    <AdminGuard>
      <div className="flex h-screen bg-background" dir="rtl">
        <Sidebar role="admin" />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
