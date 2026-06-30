import Avatar from './Avatar'
import { cn } from '@/utils/cn'

export default function AvatarGroup({ users = [], max = 4, size = 'sm', className }) {
  const visible = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((user, idx) => (
        <div key={user.id} className={cn('-ml-2 first:ml-0', idx > 0 && 'z-0')} style={{ zIndex: visible.length - idx }}>
          <Avatar user={user} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            '-ml-2 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center',
            'text-[10px] font-semibold text-gray-500',
            size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
