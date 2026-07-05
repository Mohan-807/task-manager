import Avatar from '@/components/ui/Avatar'
import { timeAgo } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import {
  GitCommitHorizontal, MessageSquare, UserPlus,
  AlertCircle, FolderPlus, RefreshCw,
} from 'lucide-react'

const TYPE_CONFIG = {
  task_created:    { icon: GitCommitHorizontal, color: 'bg-indigo-50 text-indigo-500' },
  status_changed:  { icon: RefreshCw,           color: 'bg-blue-50 text-blue-500'     },
  priority_changed:{ icon: AlertCircle,         color: 'bg-amber-50 text-amber-500'   },
  comment_added:   { icon: MessageSquare,        color: 'bg-emerald-50 text-emerald-500'},
  member_added:    { icon: UserPlus,             color: 'bg-purple-50 text-purple-500' },
  project_created: { icon: FolderPlus,           color: 'bg-pink-50 text-pink-500'    },
}

export default function ActivityTimeline({ activities }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Activity</h2>
      <p className="text-xs text-gray-400 mb-5">Recent team activity</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-100" />

        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.task_created
            const Icon = config.icon

            return (
              <div key={activity.id} className="flex gap-3 relative">
                {/* Icon bubble */}
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10',
                  config.color
                )}>
                  <Icon size={15} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-xs text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: activity.message }}
                    />
                    <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
