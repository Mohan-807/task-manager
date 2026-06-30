import { Link } from 'react-router-dom'
import { Calendar, CheckSquare, Eye, Pencil, Trash2 } from 'lucide-react'
import AvatarGroup from '@/components/ui/AvatarGroup'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatShortDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function ProjectCard({ project, members, onEdit, onDelete }) {
  const { total, done, inProgress, testing, todo } = project.tasksCount

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden',
        'hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col'
      )}
    >
      {/* Colored top strip */}
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: project.color }} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PriorityBadge priority={project.priority} />
              </div>
            </div>
          </div>
          <StatusBadge status={project.status} className="shrink-0 mt-0.5" />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400 font-medium">Progress</span>
            <span className="text-xs font-semibold text-gray-700">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} color={project.color} size="sm" />
        </div>

        {/* Task counters */}
        <div className="grid grid-cols-4 gap-1 mb-4 text-center">
          {[
            { label: 'Todo',    count: todo,       color: 'text-gray-500' },
            { label: 'Active',  count: inProgress, color: 'text-blue-600' },
            { label: 'Testing', count: testing,    color: 'text-amber-600' },
            { label: 'Done',    count: done,       color: 'text-emerald-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg py-1.5">
              <p className={cn('text-sm font-bold', color)}>{count}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-auto">
          <AvatarGroup users={members} max={4} size="xs" />
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatShortDate(project.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-50 px-5 py-3 flex items-center gap-2 bg-gray-50/50">
        <Link
          to={`/projects/${project.id}`}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg',
            'text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors'
          )}
        >
          <Eye size={13} />
          View Details
        </Link>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={() => onEdit(project)}
          className="flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          title="Edit project"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(project)}
          className="flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete project"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
