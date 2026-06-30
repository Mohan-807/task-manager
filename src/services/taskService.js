import { storage } from './storageService'
import { activityService } from './activityService'
import { projectService } from './projectService'

const DELAY = 350

const STATUS_LABELS = {
  todo:        'Todo',
  in_progress: 'In Progress',
  testing:     'Testing',
  done:        'Done',
}

export const taskService = {
  getTasks: () => new Promise((resolve) => {
    setTimeout(() => resolve(storage.getTasks()), DELAY)
  }),

  getTasksForProject: (projectId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks().filter(t => t.projectId === projectId)
      resolve(tasks)
    }, DELAY)
  }),

  getTaskById: (id) => new Promise((resolve) => {
    resolve(storage.getTasks().find(t => t.id === id) ?? null)
  }),

  createTask: (data, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks()
      const colTasks = tasks.filter(t => t.projectId === data.projectId && t.status === (data.status || 'todo'))
      const newTask = {
        id: `task_${Date.now().toString(36)}`,
        title: data.title?.trim() || 'New Task',
        description: data.description?.trim() ?? '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        projectId: data.projectId,
        assigneeId: data.assigneeId ?? null,
        reporterId: userId,
        dueDate: data.dueDate || '',
        tags: data.tags || [],
        commentsCount: 0,
        columnOrder: colTasks.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      storage.saveTasks([...tasks, newTask])
      projectService.updateTasksCount(newTask.projectId)

      activityService.addActivity({
        type: 'task_created',
        userId,
        projectId: newTask.projectId,
        taskId: newTask.id,
        message: `created task <strong>${newTask.title}</strong>`,
      })

      resolve(newTask)
    }, DELAY)
  }),

  updateTask: (id, data, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks()
      const existing = tasks.find(t => t.id === id)
      const updated = tasks.map(t =>
        t.id === id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      )
      storage.saveTasks(updated)

      if (existing) {
        if (data.priority && data.priority !== existing.priority) {
          activityService.addActivity({
            type: 'priority_changed',
            userId,
            projectId: existing.projectId,
            taskId: id,
            message: `changed priority of <strong>${existing.title}</strong> to ${data.priority}`,
          })
        }
        if (data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId) {
          const users = storage.getUsers()
          const assignee = users.find(u => u.id === data.assigneeId)
          activityService.addActivity({
            type: 'task_assigned',
            userId,
            projectId: existing.projectId,
            taskId: id,
            message: assignee
              ? `assigned <strong>${existing.title}</strong> to ${assignee.name}`
              : `unassigned <strong>${existing.title}</strong>`,
          })
        }
      }

      resolve(updated.find(t => t.id === id))
    }, DELAY)
  }),

  changeTaskStatus: (id, newStatus, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks()
      const existing = tasks.find(t => t.id === id)
      if (!existing) { resolve(null); return }

      const colTasks = tasks.filter(t => t.projectId === existing.projectId && t.status === newStatus)
      const updated = tasks.map(t =>
        t.id === id
          ? { ...t, status: newStatus, columnOrder: colTasks.length + 1, updatedAt: new Date().toISOString() }
          : t
      )
      storage.saveTasks(updated)
      projectService.updateTasksCount(existing.projectId)

      const label = STATUS_LABELS[newStatus] ?? newStatus
      activityService.addActivity({
        type: newStatus === 'done' ? 'task_completed' : 'status_changed',
        userId,
        projectId: existing.projectId,
        taskId: id,
        message: newStatus === 'done'
          ? `completed <strong>${existing.title}</strong>`
          : `moved <strong>${existing.title}</strong> to ${label}`,
      })

      resolve(updated.find(t => t.id === id))
    }, DELAY)
  }),

  deleteTask: (id, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks()
      const task = tasks.find(t => t.id === id)
      if (!task) { resolve(); return }

      storage.saveTasks(tasks.filter(t => t.id !== id))
      storage.saveComments(storage.getComments().filter(c => c.taskId !== id))
      projectService.updateTasksCount(task.projectId)

      activityService.addActivity({
        type: 'task_deleted',
        userId,
        projectId: task.projectId,
        taskId: id,
        message: `deleted task <strong>${task.title}</strong>`,
      })

      resolve()
    }, DELAY)
  }),

  reorderTask: (id, newStatus, newOrder, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const tasks = storage.getTasks()
      const task = tasks.find(t => t.id === id)
      const oldStatus = task?.status

      const updated = tasks.map(t =>
        t.id === id
          ? { ...t, status: newStatus, columnOrder: newOrder, updatedAt: new Date().toISOString() }
          : t
      )
      storage.saveTasks(updated)

      if (task && oldStatus !== newStatus) {
        projectService.updateTasksCount(task.projectId)
        activityService.addActivity({
          type: newStatus === 'done' ? 'task_completed' : 'status_changed',
          userId,
          projectId: task.projectId,
          taskId: id,
          message: newStatus === 'done'
            ? `completed <strong>${task.title}</strong>`
            : `moved <strong>${task.title}</strong> to ${STATUS_LABELS[newStatus] ?? newStatus}`,
        })
      }

      resolve(updated.find(t => t.id === id))
    }, 100)
  }),
}
