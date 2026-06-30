import { storage } from './storageService'

const DELAY = 500

export const authService = {
  login: (email, password) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = storage.getUsers()
      const user = users.find(u => u.email === email && u.password === password)
      if (!user) {
        reject(new Error('Invalid email or password'))
        return
      }
      if (user.status === 'inactive') {
        reject(new Error('Your account has been deactivated. Contact an admin.'))
        return
      }
      const { password: _, ...safeUser } = user
      const updated = { ...safeUser, lastActiveAt: new Date().toISOString() }
      storage.saveCurrentUser(updated)
      // Also update in users list
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, lastActiveAt: updated.lastActiveAt } : u
      )
      storage.saveUsers(updatedUsers)
      resolve(updated)
    }, DELAY)
  }),

  logout: () => new Promise((resolve) => {
    setTimeout(() => {
      storage.clearSession()
      resolve()
    }, 200)
  }),

  getCurrentUser: () => new Promise((resolve) => {
    resolve(storage.getCurrentUser())
  }),

  updateProfile: (userId, data) => new Promise((resolve) => {
    setTimeout(() => {
      const users = storage.getUsers()
      const updated = users.map(u =>
        u.id === userId ? { ...u, ...data } : u
      )
      storage.saveUsers(updated)
      const current = storage.getCurrentUser()
      if (current?.id === userId) {
        const updatedUser = { ...current, ...data }
        storage.saveCurrentUser(updatedUser)
        resolve(updatedUser)
      } else {
        resolve(updated.find(u => u.id === userId))
      }
    }, DELAY)
  }),
}
