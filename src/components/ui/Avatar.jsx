import { cn } from '@/utils/cn'

const SIZES = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
}

export default function Avatar({ user, size = 'md', className }) {
  const sizeClass = SIZES[size]

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={cn('rounded-full object-cover ring-2 ring-white', sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center ring-2 ring-white font-semibold text-white shrink-0',
        sizeClass,
        className
      )}
      style={{ backgroundColor: user?.color ?? '#6366f1' }}
      title={user?.name}
    >
      {user?.initials ?? '?'}
    </div>
  )
}
