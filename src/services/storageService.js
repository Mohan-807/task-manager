import usersData from '@/data/users.json'
import projectsData from '@/data/projects.json'
import tasksData from '@/data/tasks.json'
import commentsData from '@/data/comments.json'
import activitiesData from '@/data/activities.json'

const KEYS = {
  USERS:        'tf_users',
  PROJECTS:     'tf_projects',
  TASKS:        'tf_tasks',
  COMMENTS:     'tf_comments',
  ACTIVITIES:   'tf_activities',
  CURRENT_USER: 'tf_current_user',
  THEME:        'tf_theme',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — silently ignore
  }
}

function init() {
  if (!localStorage.getItem(KEYS.USERS))      save(KEYS.USERS,      usersData)
  if (!localStorage.getItem(KEYS.PROJECTS))   save(KEYS.PROJECTS,   projectsData)
  if (!localStorage.getItem(KEYS.TASKS))      save(KEYS.TASKS,      tasksData)
  if (!localStorage.getItem(KEYS.COMMENTS))   save(KEYS.COMMENTS,   commentsData)
  if (!localStorage.getItem(KEYS.ACTIVITIES)) save(KEYS.ACTIVITIES, activitiesData)
}

export const storage = {
  init,
  KEYS,

  getUsers:        () => load(KEYS.USERS,        []),
  getProjects:     () => load(KEYS.PROJECTS,     []),
  getTasks:        () => load(KEYS.TASKS,        []),
  getComments:     () => load(KEYS.COMMENTS,     []),
  getActivities:   () => load(KEYS.ACTIVITIES,   []),
  getCurrentUser:  () => load(KEYS.CURRENT_USER, null),
  getTheme:        () => load(KEYS.THEME,        'light'),

  saveUsers:       (v) => save(KEYS.USERS,        v),
  saveProjects:    (v) => save(KEYS.PROJECTS,     v),
  saveTasks:       (v) => save(KEYS.TASKS,        v),
  saveComments:    (v) => save(KEYS.COMMENTS,     v),
  saveActivities:  (v) => save(KEYS.ACTIVITIES,   v),
  saveCurrentUser: (v) => save(KEYS.CURRENT_USER, v),
  saveTheme:       (v) => save(KEYS.THEME,        v),

  clearSession: () => {
    localStorage.removeItem(KEYS.CURRENT_USER)
  },

  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  },
}
