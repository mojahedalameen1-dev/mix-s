import Sidebar from "@/components/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware (mix_admin_session cookie)
  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
