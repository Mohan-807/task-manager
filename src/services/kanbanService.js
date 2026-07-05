import { apiClient } from './apiClient'

export const kanbanService = {
  getBoard: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/kanban`)
    return data
  },

  getStats: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/kanban/stats`)
    return data
  },
}
