import { cn } from '@/utils/cn'

const STATUS_BARS = [
  { key: 'done',       label: 'Done',        color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { key: 'inProgress', label: 'In Progress', color: 'bg-blue-500',    textColor: 'text-blue-700'    },
  { key: 'testing',    label: 'Testing',     color: 'bg-amber-500',   textColor: 'text-amber-700'   },
  { key: 'todo',       label: 'Todo',        color: 'bg-gray-300',    textColor: 'text-gray-500'    },
]

export default function TaskStatusOverview({ projects }) {
  const totals = projects.reduce(
    (acc, p) => {
      acc.done += p.tasksCount.done
      acc.inProgress += p.tasksCount.inProgress
      acc.testing += p.tasksCount.testing
      acc.todo += p.tasksCount.todo
      return acc
    },
    { done: 0, inProgress: 0, testing: 0, todo: 0 }
  )

  const total = totals.done + totals.inProgress + totals.testing + totals.todo

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Task Overview</h2>
      <p className="text-xs text-gray-400 mb-5">{total} tasks across all projects</p>

      {/* Stacked progress bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-5">
        {STATUS_BARS.map(({ key, color }) => {
          const pct = total > 0 ? (totals[key] / total) * 100 : 0
          if (pct === 0) return null
          return (
            <div
              key={key}
              className={cn('h-full rounded-full transition-all duration-500', color)}
              style={{ width: `${pct}%` }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {STATUS_BARS.map(({ key, label, color, textColor }) => {
          const count = totals[key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-sm shrink-0', color)} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-semibold', textColor)}>{count}</span>
                <span className="text-xs text-gray-300 w-8 text-right">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
