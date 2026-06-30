import { cn } from '@/utils/cn'

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  className,
  textarea,
  rows = 3,
  required,
  ...props
}) {
  const baseClass = cn(
    'w-full rounded-lg border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
    'placeholder:text-gray-400 transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white',
    error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200',
    Icon && 'pl-9',
    className
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        {textarea ? (
          <textarea rows={rows} className={cn(baseClass, 'resize-none')} {...props} />
        ) : (
          <input className={baseClass} {...props} />
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
