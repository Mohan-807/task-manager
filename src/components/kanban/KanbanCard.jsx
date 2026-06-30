import { Calendar, MessageSquare, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PriorityBadge from '@/components/ui/PriorityBadge'
import Avatar from '@/components/ui/Avatar'
import { formatShortDate, isOverdue, isDueSoon } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function KanbanCard({ task, assignee, onClick, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue  = isOverdue(task.dueDate)  && task.status !== 'done'
  const dueSoon  = isDueSoon(task.dueDate)  && !overdue && task.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white rounded-xl border border-gray-100 p-3.5',
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
        'transition-all duration-150 select-none',
        isSortableDragging && 'opacity-40 shadow-none',
        isDragging && 'cursor-grabbing'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 mt-0.5 text-gray-200 group-hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors touch-none"
        >
          <GripVertical size={14} />
        </div>

        <div className="flex-1 min-w-0" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick?.()}>
          {/* Title */}
          <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-2 cursor-pointer">
            {task.title}
          </p>

          {/* Priority badge */}
          <div className="mb-3">
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <span className={cn(
                  'flex items-center gap-1 text-[11px] font-medium',
                  overdue ? 'text-red-500' : dueSoon ? 'text-amber-500' : 'text-gray-400'
                )}>
                  <Calendar size={11} />
                  {formatShortDate(task.dueDate)}
                </span>
              )}
              {task.commentsCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MessageSquare size={11} />
                  {task.commentsCount}
                </span>
              )}
            </div>
            {assignee && <Avatar user={assignee} size="xs" />}
          </div>
        </div>
      </div>
    </div>
  )
}
