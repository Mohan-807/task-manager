import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const LABEL_MAP = {
  dashboard:  'Dashboard',
  projects:   'Projects',
  members:    'Members',
  users:      'User Management',
  settings:   'Settings',
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, idx) => {
    const to = '/' + segments.slice(0, idx + 1).join('/')
    const label = LABEL_MAP[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    const isLast = idx === segments.length - 1
    return { to, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        to="/dashboard"
        className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
      >
        <Home size={14} />
      </Link>

      {crumbs.map(({ to, label, isLast }) => (
        <span key={to} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-300" />
          {isLast ? (
            <span className="text-gray-700 font-medium">{label}</span>
          ) : (
            <Link
              to={to}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
