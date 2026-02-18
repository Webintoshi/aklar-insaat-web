import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './_components/sidebar'
import { Header } from './_components/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Auth kontrolü - kullanıcı yoksa login'e yönlendir
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={{ full_name: user.email || '', email: user.email || '' }} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-200">
          {children}
        </main>
      </div>
    </div>
  )
}
