import { apiClient } from './apiClient'

export const userService = {
  getUsers: async (params = {}) => {
    const { data } = await apiClient.get('/users', { params: { per_page: 100, ...params } })
    return data
  },

  getUserById: async (id) => {
    const { data } = await apiClient.get(`/users/${id}`)
    return data
  },

  createUser: async (data) => {
    const { data: user } = await apiClient.post('/users', data)
    return user
  },

  inviteUser: async (data) => {
    const { data: user } = await apiClient.post('/users/invite', data)
    return user
  },

  updateUser: async (id, data) => {
    const { data: user } = await apiClient.patch(`/users/${id}`, data)
    return user
  },

  deleteUser: async (id) => {
    await apiClient.delete(`/users/${id}`)
  },
}
