import { apiClient } from './apiClient'

export const commentService = {
  getCommentsForTask: async (taskId, params = {}) => {
    const { data } = await apiClient.get(`/tasks/${taskId}/comments`, {
      params: { per_page: 50, ...params },
    })
    return data
  },

  addComment: async (taskId, content) => {
    const { data } = await apiClient.post(`/tasks/${taskId}/comments`, { content })
    return data
  },

  updateComment: async (id, content) => {
    const { data } = await apiClient.patch(`/comments/${id}`, { content })
    return data
  },

  deleteComment: async (id) => {
    await apiClient.delete(`/comments/${id}`)
  },
}
