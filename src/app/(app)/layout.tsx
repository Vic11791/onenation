import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'
import { GlobalSearch } from '@/components/GlobalSearch'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
        <Sidebar session={session} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar session={session} />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6">
            {children}
          </main>
        </div>
        <BottomNav />
        <GlobalSearch />
      </div>
    </ToastProvider>
  )
}
