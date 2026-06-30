import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function StatsCard({ title, value, icon: Icon, iconColor, iconBg, trend, trendLabel }) {
  const isPositive = trend >= 0

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-4">
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            )}
          >
            {isPositive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-400">{trendLabel ?? 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}
