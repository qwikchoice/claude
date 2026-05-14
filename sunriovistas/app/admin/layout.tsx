import { redirect } from 'next/navigation'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import AdminSidebarClient from '@/components/admin/AdminSidebarClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    redirect('/login')
  }

  const user = session.user as { name?: string | null; email?: string | null; image?: string | null }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebarClient user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
