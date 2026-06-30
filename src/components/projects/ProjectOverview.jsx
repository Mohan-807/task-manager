import { Calendar, User, Tag } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatDate, timeAgo } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const STATUS_STATS = [
  { key: 'todo',       label: 'Todo',        color: 'text-gray-600',    bg: 'bg-gray-50',    bar: '#94a3b8' },
  { key: 'inProgress', label: 'In Progress', color: 'text-blue-700',    bg: 'bg-blue-50',    bar: '#3b82f6' },
  { key: 'testing',    label: 'Testing',     color: 'text-amber-700',   bg: 'bg-amber-50',   bar: '#f59e0b' },
  { key: 'done',       label: 'Done',        color: 'text-emerald-700', bg: 'bg-emerald-50', bar: '#10b981' },
]

export default function ProjectOverview({ project, members, owner, activities = [], users = [] }) {
  const { total, todo, inProgress, testing, done } = project.tasksCount
  const counts = { todo, inProgress, testing, done }

  const getUser = (id) => users.find(u => u.id === id)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="xl:col-span-2 space-y-5">
        {/* Task status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_STATS.map(({ key, label, color, bg, bar }) => {
            const count = counts[key] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={key} className={cn('rounded-xl p-4', bg)}>
                <p className={cn('text-2xl font-bold', color)}>{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                <ProgressBar value={pct} color={bar} size="xs" className="mt-2" />
              </div>
            )
          })}
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">About this project</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Calendar size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 leading-none">Start Date</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{formatDate(project.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Calendar size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 leading-none">Due Date</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">
                  {project.dueDate ? formatDate(project.dueDate) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <User size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 leading-none">Project Owner</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{owner?.name ?? '—'}</p>
              </div>
            </div>
            {project.tags?.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Tag size={15} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 leading-none">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall progress */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Overall Progress</h3>
            <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} color={project.color} size="lg" />
          <p className="text-xs text-gray-400 mt-2">
            {done ?? 0} of {total} tasks completed
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Team members */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Team</h3>
            <span className="text-xs text-gray-400">{members.length} members</span>
          </div>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar user={member} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                </div>
                {member.id === project.ownerId && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        {activities.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activities.slice(0, 6).map(act => {
                const actUser = getUser(act.userId)
                return (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <Avatar user={actUser} size="xs" className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p
                        className="text-gray-500 leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: act.message }}
                      />
                      <span className="text-gray-300">{timeAgo(act.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
