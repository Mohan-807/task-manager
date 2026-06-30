import { cn } from '@/utils/cn'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-gray-100', className)}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none',
              isActive
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {Icon && <Icon size={15} className="shrink-0" />}
            {label}
            {/* Active underline */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
