import { storage } from './storageService'
import { activityService } from './activityService'

const DELAY = 400

function recalcProgress(tasksCount) {
  const { total, done } = tasksCount
  return total > 0 ? Math.round((done / total) * 100) : 0
}

export const projectService = {
  getProjects: () => new Promise((resolve) => {
    setTimeout(() => resolve(storage.getProjects()), DELAY)
  }),

  getProjectById: (id) => new Promise((resolve) => {
    const project = storage.getProjects().find(p => p.id === id) ?? null
    resolve(project)
  }),

  createProject: (data, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const projects = storage.getProjects()
      const newProject = {
        id: `proj_${Date.now().toString(36)}`,
        name: data.name.trim(),
        description: data.description?.trim() ?? '',
        status: data.status || 'active',
        priority: data.priority || 'medium',
        color: data.color || '#6366f1',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || '',
        ownerId: userId,
        memberIds: [userId],
        tags: data.tags || [],
        tasksCount: { total: 0, todo: 0, inProgress: 0, testing: 0, done: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updated = [newProject, ...projects]
      storage.saveProjects(updated)

      activityService.addActivity({
        type: 'project_created',
        userId,
        projectId: newProject.id,
        message: `created project <strong>${newProject.name}</strong>`,
      })

      // Update user's projectIds
      const users = storage.getUsers()
      storage.saveUsers(users.map(u =>
        u.id === userId ? { ...u, projectIds: [...(u.projectIds || []), newProject.id] } : u
      ))

      resolve(newProject)
    }, DELAY)
  }),

  updateProject: (id, data, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const projects = storage.getProjects()
      const existing = projects.find(p => p.id === id)
      const updated = projects.map(p =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
      storage.saveProjects(updated)

      if (existing && data.status && data.status !== existing.status) {
        activityService.addActivity({
          type: 'status_changed',
          userId,
          projectId: id,
          message: `changed project status to <strong>${data.status.replace('_', ' ')}</strong>`,
        })
      }

      resolve(updated.find(p => p.id === id))
    }, DELAY)
  }),

  deleteProject: (id, userId) => new Promise((resolve) => {
    setTimeout(() => {
      const projects = storage.getProjects().filter(p => p.id !== id)
      storage.saveProjects(projects)

      // Remove tasks for this project
      const tasks = storage.getTasks().filter(t => t.projectId !== id)
      storage.saveTasks(tasks)

      // Remove comments for those tasks
      const taskIds = storage.getTasks().filter(t => t.projectId === id).map(t => t.id)
      const comments = storage.getComments().filter(c => !taskIds.includes(c.taskId))
      storage.saveComments(comments)

      // Remove project from all users
      const users = storage.getUsers().map(u => ({
        ...u,
        projectIds: (u.projectIds || []).filter(pid => pid !== id),
      }))
      storage.saveUsers(users)

      resolve()
    }, DELAY)
  }),

  addMember: (projectId, userId, actorId) => new Promise((resolve) => {
    setTimeout(() => {
      const projects = storage.getProjects()
      const project = projects.find(p => p.id === projectId)
      if (!project) { resolve(null); return }

      if (project.memberIds.includes(userId)) { resolve(project); return }

      const updated = projects.map(p =>
        p.id === projectId
          ? { ...p, memberIds: [...p.memberIds, userId], updatedAt: new Date().toISOString() }
          : p
      )
      storage.saveProjects(updated)

      const users = storage.getUsers()
      const member = users.find(u => u.id === userId)
      storage.saveUsers(users.map(u =>
        u.id === userId
          ? { ...u, projectIds: [...(u.projectIds || []), projectId] }
          : u
      ))

      activityService.addActivity({
        type: 'member_added',
        userId: actorId,
        projectId,
        message: `added <strong>${member?.name ?? 'a user'}</strong> to the project`,
      })

      resolve(updated.find(p => p.id === projectId))
    }, DELAY)
  }),

  removeMember: (projectId, userId, actorId) => new Promise((resolve) => {
    setTimeout(() => {
      const projects = storage.getProjects()
      const project = projects.find(p => p.id === projectId)
      if (!project || project.ownerId === userId) { resolve(null); return }

      const updated = projects.map(p =>
        p.id === projectId
          ? { ...p, memberIds: p.memberIds.filter(id => id !== userId), updatedAt: new Date().toISOString() }
          : p
      )
      storage.saveProjects(updated)

      storage.saveUsers(storage.getUsers().map(u =>
        u.id === userId
          ? { ...u, projectIds: (u.projectIds || []).filter(pid => pid !== projectId) }
          : u
      ))

      const users = storage.getUsers()
      const member = users.find(u => u.id === userId)
      activityService.addActivity({
        type: 'member_removed',
        userId: actorId,
        projectId,
        message: `removed <strong>${member?.name ?? 'a user'}</strong> from the project`,
      })

      resolve(updated.find(p => p.id === projectId))
    }, DELAY)
  }),

  updateTasksCount: (projectId) => {
    const tasks = storage.getTasks().filter(t => t.projectId === projectId)
    const tasksCount = {
      total:      tasks.length,
      todo:       tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      testing:    tasks.filter(t => t.status === 'testing').length,
      done:       tasks.filter(t => t.status === 'done').length,
    }
    const progress = recalcProgress(tasksCount)
    const projects = storage.getProjects().map(p =>
      p.id === projectId ? { ...p, tasksCount, progress, updatedAt: new Date().toISOString() } : p
    )
    storage.saveProjects(projects)
    return { tasksCount, progress }
  },
}
