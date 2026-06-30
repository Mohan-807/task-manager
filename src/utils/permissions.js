export const ROLES = {
  ADMIN:     'admin',
  MANAGER:   'manager',
  DEVELOPER: 'developer',
  TESTER:    'tester',
}

const PERMISSIONS = {
  // Projects
  'project:create':       ['admin', 'manager'],
  'project:edit':         ['admin', 'manager'],
  'project:delete':       ['admin', 'manager'],
  'project:view:all':     ['admin', 'manager'],
  'project:view:assigned':['admin', 'manager', 'developer', 'tester'],
  // Tasks
  'task:create':          ['admin', 'manager', 'developer', 'tester'],
  'task:edit:any':        ['admin', 'manager', 'tester'],
  'task:edit:own':        ['admin', 'manager', 'developer'],
  'task:delete':          ['admin', 'manager', 'tester'],
  'task:delete:own':      ['admin', 'manager', 'developer', 'tester'],
  'task:move:any':        ['admin', 'manager', 'tester'],
  'task:move:own':        ['admin', 'manager', 'developer'],
  'task:reopen':          ['admin', 'manager', 'tester'],
  'task:assign':          ['admin', 'manager'],
  'task:view':            ['admin', 'manager', 'developer', 'tester'],

  // Comments
  'comment:create':       ['admin', 'manager', 'developer', 'tester'],
  'comment:edit:own':     ['admin', 'manager', 'developer', 'tester'],
  'comment:delete:own':   ['admin', 'manager', 'developer', 'tester'],
  'comment:delete:any':   ['admin'],

  // Members
  'member:manage':        ['admin', 'manager'],
  'member:view':          ['admin', 'manager', 'developer', 'tester'],

  // Users
  'user:manage':          ['admin'],
  'user:view':            ['admin', 'manager'],

  // Settings
  'settings:global':      ['admin'],
}

export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false
}

export function canEditTask(role, userId, task) {
  if (hasPermission(role, 'task:edit:any')) return true
  if (hasPermission(role, 'task:edit:own') && (task?.assigneeId === userId || task?.reporterId === userId)) return true
  return false
}

export function canDeleteTask(role, userId, task) {
  if (hasPermission(role, 'task:delete')) return true
  if (hasPermission(role, 'task:delete:own') && (task?.assigneeId === userId || task?.reporterId === userId)) return true
  return false
}

export function canMoveTask(role, userId, task) {
  if (hasPermission(role, 'task:move:any')) return true
  if (hasPermission(role, 'task:move:own') && (task?.assigneeId === userId || task?.reporterId === userId)) return true
  return false
}

export function canViewProject(role, userId, project) {
  if (hasPermission(role, 'project:view:all')) return true
  if (project?.memberIds?.includes(userId)) return true
  return false
}
