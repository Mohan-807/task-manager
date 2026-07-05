import { apiClient } from './apiClient'

export const dashboardService = {
  getStats: async () => {
    const { data } = await apiClient.get('/dashboard/stats')
    return data
  },

  getRecentProjects: async () => {
    const { data } = await apiClient.get('/dashboard/recent-projects')
    return data.data
  },

  getRecentTasks: async () => {
    const { data } = await apiClient.get('/dashboard/recent-tasks')
    return data.data
  },

  getActivities: async () => {
    const { data } = await apiClient.get('/dashboard/activities')
    return data.data
  },
}
