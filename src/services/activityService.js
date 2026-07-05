import { apiClient } from './apiClient'

export const activityService = {
  getActivities: async (params = {}) => {
    const { data } = await apiClient.get('/activities', { params: { per_page: 20, ...params } })
    return data
  },

  getProjectActivities: async (projectId, params = {}) => {
    const { data } = await apiClient.get(`/projects/${projectId}/activities`, {
      params: { per_page: 20, ...params },
    })
    return data
  },

  getTaskActivities: async (taskId, params = {}) => {
    const { data } = await apiClient.get(`/tasks/${taskId}/activities`, { params })
    return data
  },
}
