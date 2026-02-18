import { createClient } from '@/lib/supabase/server'
import { Building2, FileText, MessageSquare, FolderKanban } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  
  const [pagesResult, projectsResult, messagesResult, ongoingResult] = await Promise.all([
    supabase.from('pages').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'ongoing'),
  ])

  return {
    pages: pagesResult.count || 0,
    completedProjects: projectsResult.count || 0,
    ongoingProjects: ongoingResult.count || 0,
    unreadMessages: messagesResult.count || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Sayfalar',
      value: stats.pages,
      icon: FileText,
      href: '/admin/pages',
      color: 'bg-blue-600',
    },
    {
      title: 'Tamamlanmış Projeler',
      value: stats.completedProjects,
      icon: Building2,
      href: '/admin/projects/completed',
      color: 'bg-green-600',
    },
    {
      title: 'Devam Eden Projeler',
      value: stats.ongoingProjects,
      icon: FolderKanban,
      href: '/admin/projects/ongoing',
      color: 'bg-yellow-600',
    },
    {
      title: 'Okunmamış Mesajlar',
      value: stats.unreadMessages,
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'bg-red-600',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ana Sayfa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
