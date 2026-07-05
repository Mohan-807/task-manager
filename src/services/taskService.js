import { apiClient } from './apiClient'

export const taskService = {
  getTasksForProject: async (projectId, params = {}) => {
    const { data } = await apiClient.get(`/projects/${projectId}/tasks`, {
      params: { per_page: 100, ...params },
    })
    return data
  },

  getTaskById: async (id) => {
    const { data } = await apiClient.get(`/tasks/${id}`)
    return data
  },

  createTask: async (data) => {
    const { projectId, ...body } = data
    const { data: task } = await apiClient.post(`/projects/${projectId}/tasks`, body)
    return task
  },

  updateTask: async (id, data) => {
    // Whitelisted so passing a full task-detail object (with nested assignee/reporter,
    // commentsCount, etc.) never leaks read-only fields into the PATCH body.
    const { title, description, status, priority, assigneeId, dueDate, tags } = data
    const body = { title, description, status, priority, assigneeId, dueDate, tags }
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key])
    const { data: task } = await apiClient.patch(`/tasks/${id}`, body)
    return task
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}`)
  },

  updateStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/tasks/${id}/status`, { status })
    return data
  },

  updatePriority: async (id, priority) => {
    const { data } = await apiClient.patch(`/tasks/${id}/priority`, { priority })
    return data
  },

  updateAssignee: async (id, assigneeId) => {
    const { data } = await apiClient.patch(`/tasks/${id}/assignee`, { assigneeId })
    return data
  },

  updateDueDate: async (id, dueDate) => {
    const { data } = await apiClient.patch(`/tasks/${id}/due-date`, { dueDate })
    return data
  },

  moveTask: async (id, status, columnOrder) => {
    const { data } = await apiClient.patch(`/tasks/${id}/move`, { status, columnOrder })
    return data
  },
}
