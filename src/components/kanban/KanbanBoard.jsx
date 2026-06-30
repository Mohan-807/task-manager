import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import TaskDrawer from '@/components/tasks/TaskDrawer'
import { useAuth } from '@/contexts/AuthContext'
import { useTasks } from '@/contexts/TaskContext'
import { useNotification } from '@/contexts/NotificationContext'
import { canMoveTask, hasPermission } from '@/utils/permissions'

const COLUMNS = ['todo', 'in_progress', 'testing', 'done']

const DROP_ANIMATION = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
}

export default function KanbanBoard({ tasks, users, projectId }) {
  const { user } = useAuth()
  const { reorderTask, createTask, deleteTask, updateTask } = useTasks()
  const toast = useNotification()

  const [activeId, setActiveId]         = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const tasksByColumn = useMemo(() => COLUMNS.reduce((acc, col) => {
    acc[col] = tasks
      .filter(t => t.status === col)
      .sort((a, b) => a.columnOrder - b.columnOrder)
    return acc
  }, {}), [tasks])

  const activeTask = useMemo(
    () => tasks.find(t => t.id === activeId) ?? null,
    [tasks, activeId]
  )

  const canCreate = hasPermission(user?.role, 'task:create')

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveId(null)
    if (!over) return

    const taskId     = active.id
    const task       = tasks.find(t => t.id === taskId)
    if (!task) return

    if (!canMoveTask(user?.role, user?.id, task)) {
      toast.warning('Permission denied', 'You can only move tasks assigned to or created by you.')
      return
    }

    if (task.status === 'done' && !hasPermission(user?.role, 'task:reopen')) {
      toast.warning('Permission denied', 'You cannot reopen completed tasks.')
      return
    }

    // Determine target column from over.id
    // over.id can be a column id (drop on empty column) or a task id (drop on card)
    let targetColumn = over.id
    if (!COLUMNS.includes(targetColumn)) {
      const overTask = tasks.find(t => t.id === over.id)
      targetColumn = overTask?.status ?? task.status
    }

    if (targetColumn === task.status) return

    const colTasks  = tasks.filter(t => t.projectId === projectId && t.status === targetColumn)
    const newOrder  = colTasks.length + 1

    await reorderTask(taskId, targetColumn, newOrder, user.id)

    const colLabel = { todo: 'Todo', in_progress: 'In Progress', testing: 'Testing', done: 'Done' }
    toast.success('Task moved', `Moved to ${colLabel[targetColumn] ?? targetColumn}`)
  }, [tasks, user, projectId, reorderTask, toast])

  const handleAddTask = useCallback(async (columnId) => {
    if (!canCreate) {
      toast.warning('Permission denied', 'You do not have permission to create tasks.')
      return
    }
    const task = await createTask({
      title: 'New Task',
      status: columnId,
      projectId,
      priority: 'medium',
    }, user.id)
    setSelectedTask(task)
    toast.success('Task created')
  }, [canCreate, createTask, projectId, user, toast])

  const handleSaveTask = useCallback(async (updated) => {
    try {
      await updateTask(updated.id, updated, user.id)
      toast.success('Task saved')
      setSelectedTask(null)
    } catch {
      toast.error('Failed to save task')
    }
  }, [updateTask, user, toast])

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId, user.id)
      toast.success('Task deleted')
      setSelectedTask(null)
    } catch {
      toast.error('Failed to delete task')
    }
  }, [deleteTask, user, toast])

  const getUser = (id) => users.find(u => u.id === id)

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col}
              columnId={col}
              tasks={tasksByColumn[col]}
              users={users}
              activeId={activeId}
              onCardClick={setSelectedTask}
              onAddTask={handleAddTask}
              canCreate={canCreate}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={DROP_ANIMATION}>
          {activeTask && (
            <div className="rotate-1 opacity-95 shadow-xl">
              <KanbanCard
                task={activeTask}
                assignee={getUser(activeTask.assigneeId)}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        task={selectedTask}
        users={users}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        projectId={projectId}
      />
    </>
  )
}
