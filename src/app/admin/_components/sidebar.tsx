'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  FolderKanban, 
  MessageSquare,
  LogOut,
  Home,
  Info,
  Video,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Ana Sayfa', href: '/admin', icon: LayoutDashboard },
  { name: 'Hero Bölümü', href: '/admin/hero', icon: Home },
  { name: 'Hakkımızda', href: '/admin/about', icon: Info },
  { name: 'Video Bölümü', href: '/admin/video', icon: Video },
  { name: 'İstatistikler', href: '/admin/infocards', icon: BarChart3 },
  { name: 'Sayfalar', href: '/admin/pages', icon: FileText },
  { name: 'Tamamlanmış Projeler', href: '/admin/projects/completed', icon: Building2 },
  { name: 'Devam Eden Projeler', href: '/admin/projects/ongoing', icon: FolderKanban },
  { name: 'İletişim Mesajları', href: '/admin/messages', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 bg-white px-4">
        <img 
          src="/logoypng_48.png" 
          alt="Aklar İnşaat" 
          className="max-h-12 max-w-full w-auto object-contain"
        />
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
