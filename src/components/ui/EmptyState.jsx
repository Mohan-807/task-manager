import { cn } from '@/utils/cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-20 px-6 text-center',
      'bg-white border border-gray-100 rounded-2xl',
      className
    )}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <Icon size={26} className="text-gray-300" />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
