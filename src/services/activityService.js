import { storage } from './storageService'

export const activityService = {
  getActivities: () => new Promise((resolve) => {
    resolve(storage.getActivities())
  }),

  getActivitiesForProject: (projectId) => new Promise((resolve) => {
    const all = storage.getActivities()
    resolve(all.filter(a => a.projectId === projectId))
  }),

  getActivitiesForTask: (taskId) => new Promise((resolve) => {
    const all = storage.getActivities()
    resolve(all.filter(a => a.taskId === taskId))
  }),

  addActivity: (data) => {
    const activity = {
      id: `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,
      type: data.type,
      userId: data.userId,
      projectId: data.projectId ?? null,
      taskId: data.taskId ?? null,
      message: data.message,
      createdAt: new Date().toISOString(),
    }
    const all = storage.getActivities()
    storage.saveActivities([activity, ...all])
    return activity
  },
}
