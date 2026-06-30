import { useState } from 'react'
import { Bell, Menu, LogOut, Settings, User } from 'lucide-react'
import Breadcrumb from './Breadcrumb'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'

export default function TopNav({ onMobileMenuToggle }) {
  const { user, logout } = useAuth()
  const toast = useNotification()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    toast.info('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 relative">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications bell (visual) */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2.5 pl-2 pr-2 rounded-lg hover:bg-gray-50 transition-colors group h-10"
          >
            <Avatar user={user} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              {/* Dropdown */}
              <div className={cn(
                'absolute right-0 top-12 z-20 w-52',
                'bg-white rounded-xl border border-gray-100 shadow-lg py-1',
                'animate-[slideUp_0.15s_ease_both]'
              )}>
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={15} className="text-gray-400" />
                  Settings
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings') }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  My Profile
                </button>

                <div className="border-t border-gray-50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
