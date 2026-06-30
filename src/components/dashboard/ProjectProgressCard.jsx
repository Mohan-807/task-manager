import { Link } from 'react-router-dom'
import { CheckSquare, ArrowRight } from 'lucide-react'
import AvatarGroup from '@/components/ui/AvatarGroup'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatShortDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function ProjectProgressCard({ project, members }) {
  const { total, done } = project.tasksCount

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {project.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Due {formatShortDate(project.dueDate)}</p>
          </div>
        </div>
        <StatusBadge status={project.status} className="shrink-0" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} color={project.color} size="sm" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <AvatarGroup users={members} max={4} size="xs" />
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <CheckSquare size={12} />
          <span>{done}/{total} tasks</span>
        </div>
      </div>
    </Link>
  )
}
