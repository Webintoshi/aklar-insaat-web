import { User } from 'lucide-react'

interface HeaderProps {
  user: {
    full_name: string | null
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">{user.full_name || user.email}</span>
        </div>
      </div>
    </header>
  )
}
