import { apiClient } from './apiClient'

export const projectService = {
  getProjects: async (params = {}) => {
    const { data } = await apiClient.get('/projects', { params: { per_page: 100, ...params } })
    return data
  },

  getProjectById: async (id) => {
    const { data } = await apiClient.get(`/projects/${id}`)
    return data
  },

  createProject: async (data) => {
    const { data: project } = await apiClient.post('/projects', data)
    return project
  },

  updateProject: async (id, data) => {
    const { data: project } = await apiClient.patch(`/projects/${id}`, data)
    return project
  },

  deleteProject: async (id) => {
    await apiClient.delete(`/projects/${id}`)
  },

  getMembers: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/members`)
    return data.data
  },

  addMember: async (projectId, userId) => {
    const { data } = await apiClient.post(`/projects/${projectId}/members`, { user_id: userId })
    return data.data
  },

  removeMember: async (projectId, userId) => {
    const { data } = await apiClient.delete(`/projects/${projectId}/members/${userId}`)
    return data.data
  },

  updateMemberRole: async (projectId, userId, role) => {
    const { data } = await apiClient.patch(`/projects/${projectId}/members/${userId}`, { role })
    return data
  },
}
