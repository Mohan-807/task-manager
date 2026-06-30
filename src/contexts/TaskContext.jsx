import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { taskService } from '@/services/taskService'
import { commentService } from '@/services/commentService'
import { activityService } from '@/services/activityService'

const TaskContext = createContext(null)

const initialState = {
  tasks:      [],
  comments:   {},   // { taskId: Comment[] }
  activities: [],
  loading:    false,
  error:      null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_TASKS_START': return { ...state, loading: true, error: null }
    case 'LOAD_TASKS_OK':    return { ...state, tasks: action.tasks, loading: false }
    case 'LOAD_TASKS_FAIL':  return { ...state, loading: false, error: action.error }

    case 'ADD_TASK':    return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return {
      ...state,
      tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t),
    }
    case 'REMOVE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }

    case 'MOVE_TASK_INSTANT': return {
      ...state,
      tasks: state.tasks.map(t =>
        t.id === action.id
          ? { ...t, status: action.status, columnOrder: action.order }
          : t
      ),
    }

    case 'LOAD_COMMENTS': return {
      ...state,
      comments: { ...state.comments, [action.taskId]: action.comments },
    }
    case 'ADD_COMMENT': {
      const existing = state.comments[action.comment.taskId] ?? []
      return {
        ...state,
        comments: { ...state.comments, [action.comment.taskId]: [...existing, action.comment] },
        tasks: state.tasks.map(t =>
          t.id === action.comment.taskId
            ? { ...t, commentsCount: (t.commentsCount || 0) + 1 }
            : t
        ),
      }
    }
    case 'UPDATE_COMMENT': {
      const taskId = action.comment.taskId
      return {
        ...state,
        comments: {
          ...state.comments,
          [taskId]: (state.comments[taskId] ?? []).map(c =>
            c.id === action.comment.id ? action.comment : c
          ),
        },
      }
    }
    case 'REMOVE_COMMENT': {
      const taskId = action.taskId
      return {
        ...state,
        comments: {
          ...state.comments,
          [taskId]: (state.comments[taskId] ?? []).filter(c => c.id !== action.id),
        },
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, commentsCount: Math.max(0, (t.commentsCount || 1) - 1) }
            : t
        ),
      }
    }

    case 'LOAD_ACTIVITIES': return { ...state, activities: action.activities }

    default: return state
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadTasks = useCallback(async () => {
    dispatch({ type: 'LOAD_TASKS_START' })
    try {
      const tasks = await taskService.getTasks()
      dispatch({ type: 'LOAD_TASKS_OK', tasks })
    } catch (err) {
      dispatch({ type: 'LOAD_TASKS_FAIL', error: err.message })
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const loadActivities = useCallback(async () => {
    const activities = await activityService.getActivities()
    dispatch({ type: 'LOAD_ACTIVITIES', activities })
  }, [])

  useEffect(() => { loadActivities() }, [loadActivities])

  const createTask = useCallback(async (data, userId) => {
    const task = await taskService.createTask(data, userId)
    dispatch({ type: 'ADD_TASK', task })
    await loadActivities()
    return task
  }, [loadActivities])

  const updateTask = useCallback(async (id, data, userId) => {
    const task = await taskService.updateTask(id, data, userId)
    dispatch({ type: 'UPDATE_TASK', task })
    await loadActivities()
    return task
  }, [loadActivities])

  const changeTaskStatus = useCallback(async (id, newStatus, userId) => {
    const task = await taskService.changeTaskStatus(id, newStatus, userId)
    if (task) dispatch({ type: 'UPDATE_TASK', task })
    await loadActivities()
    return task
  }, [loadActivities])

  const moveTaskInstant = useCallback((id, status, order) => {
    dispatch({ type: 'MOVE_TASK_INSTANT', id, status, order })
  }, [])

  const reorderTask = useCallback(async (id, newStatus, newOrder, userId) => {
    dispatch({ type: 'MOVE_TASK_INSTANT', id, status: newStatus, order: newOrder })
    const task = await taskService.reorderTask(id, newStatus, newOrder, userId)
    if (task) dispatch({ type: 'UPDATE_TASK', task })
    await loadActivities()
    return task
  }, [loadActivities])

  const deleteTask = useCallback(async (id, userId) => {
    await taskService.deleteTask(id, userId)
    dispatch({ type: 'REMOVE_TASK', id })
    await loadActivities()
  }, [loadActivities])

  const loadComments = useCallback(async (taskId) => {
    const comments = await commentService.getCommentsForTask(taskId)
    dispatch({ type: 'LOAD_COMMENTS', taskId, comments })
    return comments
  }, [])

  const addComment = useCallback(async (taskId, content, userId, projectId) => {
    const comment = await commentService.addComment(taskId, content, userId, projectId)
    dispatch({ type: 'ADD_COMMENT', comment })
    await loadActivities()
    return comment
  }, [loadActivities])

  const updateComment = useCallback(async (id, content, userId) => {
    const comment = await commentService.updateComment(id, content, userId)
    dispatch({ type: 'UPDATE_COMMENT', comment })
    return comment
  }, [])

  const deleteComment = useCallback(async (id, taskId, userId, isAdmin) => {
    await commentService.deleteComment(id, userId, isAdmin)
    dispatch({ type: 'REMOVE_COMMENT', id, taskId })
  }, [])

  const getTasksForProject = useCallback((projectId) => {
    return state.tasks.filter(t => t.projectId === projectId)
  }, [state.tasks])

  return (
    <TaskContext.Provider value={{
      ...state,
      loadTasks,
      loadActivities,
      createTask,
      updateTask,
      changeTaskStatus,
      moveTaskInstant,
      reorderTask,
      deleteTask,
      loadComments,
      addComment,
      updateComment,
      deleteComment,
      getTasksForProject,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}
