import { cn } from '@/utils/cn'

const VARIANTS = {
  primary:   'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-600',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  'danger-ghost': 'bg-transparent hover:bg-red-50 text-gray-400 hover:text-red-500',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  icon: 'p-2 rounded-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  disabled,
  loading,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 13 : 15} className="shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight size={size === 'sm' ? 13 : 15} className="shrink-0" />
      )}
    </button>
  )
}
