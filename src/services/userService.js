import { storage } from './storageService'

const DELAY = 400

function makeInitials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6','#06b6d4','#f97316','#14b8a6']
function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)] }

export const userService = {
  getUsers: () => new Promise((resolve) => {
    setTimeout(() => resolve(storage.getUsers()), DELAY)
  }),

  getUserById: (id) => new Promise((resolve) => {
    const user = storage.getUsers().find(u => u.id === id) ?? null
    resolve(user)
  }),

  createUser: (data) => new Promise((resolve) => {
    setTimeout(() => {
      const users = storage.getUsers()
      const newUser = {
        id: `user_${Date.now().toString(36)}`,
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password || 'changeme123',
        role: data.role || 'developer',
        status: data.status || 'invited',
        avatarUrl: null,
        initials: makeInitials(data.name),
        color: randomColor(),
        department: data.department || '',
        projectIds: [],
        joinedAt: new Date().toISOString(),
        lastActiveAt: null,
      }
      const updated = [newUser, ...users]
      storage.saveUsers(updated)
      const { password: _, ...safe } = newUser
      resolve(safe)
    }, DELAY)
  }),

  updateUser: (id, data) => new Promise((resolve) => {
    setTimeout(() => {
      const users = storage.getUsers()
      const updated = users.map(u =>
        u.id === id
          ? { ...u, ...data, initials: data.name ? makeInitials(data.name) : u.initials }
          : u
      )
      storage.saveUsers(updated)
      resolve(updated.find(u => u.id === id))
    }, DELAY)
  }),

  deleteUser: (id) => new Promise((resolve) => {
    setTimeout(() => {
      const users = storage.getUsers().filter(u => u.id !== id)
      storage.saveUsers(users)
      resolve()
    }, DELAY)
  }),

  inviteUser: (data) => new Promise((resolve) => {
    setTimeout(() => {
      const users = storage.getUsers()
      const newUser = {
        id: `user_${Date.now().toString(36)}`,
        name: data.name.trim(),
        email: data.email.trim(),
        password: 'invited123',
        role: data.role || 'developer',
        status: 'invited',
        avatarUrl: null,
        initials: makeInitials(data.name),
        color: randomColor(),
        department: data.department || '',
        projectIds: [],
        joinedAt: new Date().toISOString(),
        lastActiveAt: null,
      }
      const updated = [...users, newUser]
      storage.saveUsers(updated)
      const { password: _, ...safe } = newUser
      resolve(safe)
    }, DELAY)
  }),
}
