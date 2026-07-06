import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import { cn } from '@/utils/cn'

const COLUMN_CONFIG = {
  todo:        { label: 'Todo',        dot: 'bg-gray-400',    header: 'bg-gray-50',    border: 'border-gray-200' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    header: 'bg-blue-50',    border: 'border-blue-100' },
  testing:     { label: 'Testing',     dot: 'bg-amber-500',   header: 'bg-amber-50',   border: 'border-amber-100'},
  done:        { label: 'Done',        dot: 'bg-emerald-500', header: 'bg-emerald-50', border: 'border-emerald-100'},
}

export default function KanbanColumn({ columnId, tasks, users, activeId, movingTaskId, onCardClick, onAddTask, canCreate }) {
  const config = COLUMN_CONFIG[columnId]

  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  const getUser = (id) => users.find(u => u.id === id)

  return (
    <div className="flex flex-col min-w-72 w-72 flex-shrink-0">
      {/* Column header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 rounded-xl mb-3',
        config.header
      )}>
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
          <span className="text-sm font-semibold text-gray-700">{config.label}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 text-gray-500">
            {tasks.length}
          </span>
        </div>
        {canCreate && (
          <button
            onClick={() => onAddTask(columnId)}
            className="p-1 rounded-lg text-gray-400 hover:bg-white/80 hover:text-gray-600 transition-colors"
            title={`Add task to ${config.label}`}
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {/* Droppable cards area */}
      <SortableContext
        id={columnId}
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2.5 flex-1 min-h-20 pb-2 rounded-xl transition-colors duration-150',
            isOver && 'bg-indigo-50/60 ring-2 ring-indigo-200 ring-dashed'
          )}
        >
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              assignee={getUser(task.assigneeId)}
              onClick={() => onCardClick(task)}
              isDragging={activeId === task.id}
              isMoving={movingTaskId === task.id}
            />
          ))}

          {tasks.length === 0 && (
            <div className={cn(
              'rounded-xl border-2 border-dashed py-8 flex items-center justify-center',
              'text-xs text-gray-300',
              config.border
            )}>
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add task footer */}
      {canCreate && (
        <button
          onClick={() => onAddTask(columnId)}
          className="flex items-center gap-1.5 w-full px-3 py-2 mt-1 rounded-xl text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <Plus size={13} />
          Add task
        </button>
      )}
    </div>
  )
}
