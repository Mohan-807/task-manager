import { cn } from '@/utils/cn'

export default function ProgressBar({ value = 0, color, showLabel = false, size = 'md', className }) {
  const clamped = Math.min(100, Math.max(0, value))

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  }

  const getColor = () => {
    if (color) return color
    if (clamped === 100) return '#10b981'
    if (clamped >= 60) return '#6366f1'
    if (clamped >= 30) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: getColor() }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 font-medium w-8 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  )
}
