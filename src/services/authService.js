import { apiClient } from './apiClient'
import { tokenService } from './tokenService'

export const authService = {
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    tokenService.setTokens(data)
    return data.user
  },

  logout: async () => {
    tokenService.clearTokens()
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },
}
