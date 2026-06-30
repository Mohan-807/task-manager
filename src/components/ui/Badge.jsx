import { cn } from '@/utils/cn'

const VARIANTS = {
  default:  'bg-gray-100 text-gray-600',
  primary:  'bg-indigo-50 text-indigo-700',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-sky-50 text-sky-700',
  purple:   'bg-purple-50 text-purple-700',
  pink:     'bg-pink-50 text-pink-700',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
