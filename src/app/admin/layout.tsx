import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import AdminGuard from "@/components/AdminGuard"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
  } catch (e: any) {
    return (
      <div className="min-h-screen flex items-center justify-center p-20 bg-zinc-950 text-red-500">
        <div className="p-10 border-2 border-red-500 rounded-3xl">
          <h1 className="text-xl font-black">Layout Render Error</h1>
          <p>{e.message}</p>
        </div>
      </div>
    )
  }
}
