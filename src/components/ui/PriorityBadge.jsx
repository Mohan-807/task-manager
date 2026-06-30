import { cn } from '@/utils/cn'
import { ArrowDown, ArrowRight, ArrowUp, ChevronsUp } from 'lucide-react'

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', icon: ChevronsUp, bg: 'bg-red-50',    text: 'text-red-700',    iconColor: 'text-red-500'    },
  high:     { label: 'High',     icon: ArrowUp,    bg: 'bg-orange-50',  text: 'text-orange-700', iconColor: 'text-orange-500' },
  medium:   { label: 'Medium',   icon: ArrowRight, bg: 'bg-yellow-50',  text: 'text-yellow-700', iconColor: 'text-yellow-500' },
  low:      { label: 'Low',      icon: ArrowDown,  bg: 'bg-slate-50',   text: 'text-slate-600',  iconColor: 'text-slate-400'  },
}

export default function PriorityBadge({ priority, showLabel = true, className }) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon size={11} className={cn('shrink-0', config.iconColor)} />
      {showLabel && config.label}
    </span>
  )
}
