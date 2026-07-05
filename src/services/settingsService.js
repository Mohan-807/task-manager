import { apiClient } from './apiClient'

export const settingsService = {
  updateProfile: async (data) => {
    const { data: user } = await apiClient.patch('/settings/profile', data)
    return user
  },

  changePassword: async (data) => {
    const { data: result } = await apiClient.patch('/settings/password', data)
    return result
  },

  updateNotifications: async (data) => {
    const { data: prefs } = await apiClient.patch('/settings/notifications', data)
    return prefs
  },

  updateAppearance: async (data) => {
    const { data: appearance } = await apiClient.patch('/settings/appearance', data)
    return appearance
  },
}
