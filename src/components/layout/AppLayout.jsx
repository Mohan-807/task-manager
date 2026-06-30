import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import { cn } from '@/utils/cn'

export default function AppLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, overlay on tablet, fixed on desktop */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMobileMenuToggle={() => setMobileOpen(o => !o)} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto scrollbar-none bg-surface-subtle">
          <div key={location.pathname} className="animate-[fadeIn_0.18s_ease] min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
