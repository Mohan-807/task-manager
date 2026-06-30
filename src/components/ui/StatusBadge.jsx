import { cn } from '@/utils/cn'

const STATUS_CONFIG = {
  todo:        { label: 'Todo',        dot: 'bg-gray-400',    bg: 'bg-gray-100',    text: 'text-gray-600'   },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'   },
  testing:     { label: 'Testing',     dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'  },
  done:        { label: 'Done',        dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700'},
  active:      { label: 'Active',      dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700'},
  completed:   { label: 'Completed',   dot: 'bg-indigo-500',  bg: 'bg-indigo-50',   text: 'text-indigo-700' },
  invited:     { label: 'Invited',     dot: 'bg-sky-500',     bg: 'bg-sky-50',      text: 'text-sky-700'    },
  inactive:    { label: 'Inactive',    dot: 'bg-gray-300',    bg: 'bg-gray-100',    text: 'text-gray-400'   },
}

export default function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  )
}
