import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquare, Calendar } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import { formatShortDate, isOverdue } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function RecentTasks({ tasks, users, projects }) {
  const getUser = (id) => users.find(u => u.id === id)
  const getProject = (id) => projects.find(p => p.id === id)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recent Tasks</h2>
          <p className="text-xs text-gray-400 mt-0.5">Latest activity across all projects</p>
        </div>
        <Link
          to="/projects"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-50">
          {tasks.map(task => {
            const assignee = getUser(task.assigneeId)
            const project = getProject(task.projectId)
            const overdue = isOverdue(task.dueDate) && task.status !== 'done'

            return (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer group"
              >
                {/* Title + project */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {project && (
                      <span
                        className="text-xs text-gray-400 flex items-center gap-1"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={task.priority} showLabel={false} />
                  <StatusBadge status={task.status} />
                </div>

                {/* Meta */}
                <div className="hidden md:flex items-center gap-3 shrink-0 text-xs text-gray-400">
                  {task.commentsCount > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {task.commentsCount}
                    </span>
                  )}
                  <span className={cn('flex items-center gap-1', overdue && 'text-red-500 font-medium')}>
                    <Calendar size={12} />
                    {formatShortDate(task.dueDate)}
                  </span>
                </div>

                {/* Assignee */}
                {assignee && <Avatar user={assignee} size="sm" className="shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
