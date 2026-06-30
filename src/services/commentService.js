import { storage } from './storageService'
import { activityService } from './activityService'

const DELAY = 300

export const commentService = {
  getCommentsForTask: (taskId) => new Promise((resolve) => {
    setTimeout(() => {
      const comments = storage.getComments().filter(c => c.taskId === taskId)
      resolve(comments)
    }, DELAY)
  }),

  addComment: (taskId, content, userId, projectId) => new Promise((resolve) => {
    setTimeout(() => {
      const comment = {
        id: `cmt_${Date.now().toString(36)}`,
        taskId,
        userId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isEdited: false,
      }
      const comments = [...storage.getComments(), comment]
      storage.saveComments(comments)

      // Increment commentsCount on task
      const tasks = storage.getTasks().map(t =>
        t.id === taskId
          ? { ...t, commentsCount: (t.commentsCount || 0) + 1 }
          : t
      )
      storage.saveTasks(tasks)

      const task = tasks.find(t => t.id === taskId)
      activityService.addActivity({
        type: 'comment_added',
        userId,
        projectId: projectId ?? task?.projectId ?? null,
        taskId,
        message: `commented on <strong>${task?.title ?? 'a task'}</strong>`,
      })

      resolve(comment)
    }, DELAY)
  }),

  updateComment: (id, content, userId) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const comments = storage.getComments()
      const comment = comments.find(c => c.id === id)
      if (!comment) { reject(new Error('Comment not found')); return }
      if (comment.userId !== userId) { reject(new Error('Not authorized')); return }

      const updated = comments.map(c =>
        c.id === id
          ? { ...c, content: content.trim(), updatedAt: new Date().toISOString(), isEdited: true }
          : c
      )
      storage.saveComments(updated)
      resolve(updated.find(c => c.id === id))
    }, DELAY)
  }),

  deleteComment: (id, userId, isAdmin) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const comments = storage.getComments()
      const comment = comments.find(c => c.id === id)
      if (!comment) { reject(new Error('Comment not found')); return }
      if (!isAdmin && comment.userId !== userId) { reject(new Error('Not authorized')); return }

      storage.saveComments(comments.filter(c => c.id !== id))

      // Decrement commentsCount
      const tasks = storage.getTasks().map(t =>
        t.id === comment.taskId
          ? { ...t, commentsCount: Math.max(0, (t.commentsCount || 1) - 1) }
          : t
      )
      storage.saveTasks(tasks)

      resolve()
    }, DELAY)
  }),
}
