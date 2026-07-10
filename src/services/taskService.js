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

  // PATCH /tasks/:id only accepts title/description/tags — status, priority,
  // assigneeId and dueDate each live behind their own dedicated endpoint below
  // (and each returns a partial shape), so a task edit fans out into whichever
  // of those changed and merges the partial responses onto the original task
  // instead of an extra GET — the caller's own list refetch will supersede
  // this anyway once the project sync (triggered right after) completes.
  updateTask: async (id, data, original = {}) => {
    const { title, description, tags, status, priority, assigneeId, dueDate } = data

    let task = { ...original, id }

    const body = { title, description, tags }
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key])
    if (Object.keys(body).length) {
      await apiClient.patch(`/tasks/${id}`, body)
      task = { ...task, ...body }
    }
    if (status !== undefined && status !== original.status) {
      await taskService.updateStatus(id, status)
      task.status = status
    }
    if (priority !== undefined && priority !== original.priority) {
      await taskService.updatePriority(id, priority)
      task.priority = priority
    }
    if (assigneeId !== undefined && assigneeId !== original.assigneeId) {
      await taskService.updateAssignee(id, assigneeId)
      task.assigneeId = assigneeId
    }
    if (dueDate !== undefined && dueDate !== original.dueDate) {
      await taskService.updateDueDate(id, dueDate)
      task.dueDate = dueDate
    }

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
