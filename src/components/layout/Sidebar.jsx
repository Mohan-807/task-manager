import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { hasPermission } from '@/utils/permissions'

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useNotification()

  const canViewUsers = hasPermission(user?.role, 'user:manage')

  const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Projects',  icon: FolderKanban,    to: '/projects'  },
    { label: 'Members',   icon: Users,            to: '/members'   },
    ...(canViewUsers ? [{ label: 'Users', icon: ShieldCheck, to: '/users' }] : []),
    { label: 'Settings',  icon: Settings,         to: '/settings'  },
  ]

  const handleLogout = async () => {
    await logout()
    toast.info('Signed out', 'You have been signed out.')
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-[#0f0f10] border-r border-sidebar-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center px-0' : 'px-5 gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-base tracking-tight">TaskFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-[#8b8b99] hover:bg-white/5 hover:text-white'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-2 pb-4 shrink-0 border-t border-sidebar-border pt-3 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ backgroundColor: user.color ?? '#6366f1' }}
            >
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-[#8b8b99] capitalize truncate">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium',
            'text-[#8b8b99] hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-18 z-10',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'bg-sidebar-border border border-[#2e2e35] text-[#8b8b99]',
          'hover:bg-[#2e2e35] hover:text-white transition-colors duration-150'
        )}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
