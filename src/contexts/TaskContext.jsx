import { createContext, useContext, useReducer, useCallback } from 'react'
import { taskService } from '@/services/taskService'
import { commentService } from '@/services/commentService'
import { useProjects } from '@/contexts/ProjectContext'

const TaskContext = createContext(null)

const initialState = {
  tasks:    [],
  comments: {},   // { taskId: Comment[] }
  loading:  false,
  error:    null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_TASKS_START': return { ...state, loading: true, error: null }
    case 'LOAD_TASKS_OK':    return {
      ...state,
      // action.projectId can be a route-param string while t.projectId is numeric
      // from the API — compare as strings to avoid leaving stale tasks in state.
      tasks: [...state.tasks.filter(t => String(t.projectId) !== String(action.projectId)), ...action.tasks],
      loading: false,
    }
    case 'LOAD_TASKS_FAIL':  return { ...state, loading: false, error: action.error }

    case 'ADD_TASK':    return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return {
      ...state,
      tasks: state.tasks.map(t => t.id === action.task.id ? { ...t, ...action.task } : t),
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

    default: return state
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { fetchProjectById } = useProjects()

  const loadTasksForProject = useCallback(async (projectId, params) => {
    dispatch({ type: 'LOAD_TASKS_START' })
    try {
      const { data: tasks } = await taskService.getTasksForProject(projectId, params)
      dispatch({ type: 'LOAD_TASKS_OK', projectId, tasks })
    } catch (err) {
      dispatch({ type: 'LOAD_TASKS_FAIL', error: err.message })
    }
  }, [])

  const createTask = useCallback(async (data) => {
    const task = await taskService.createTask(data)
    dispatch({ type: 'ADD_TASK', task })
    await fetchProjectById(String(task.projectId))
    return task
  }, [fetchProjectById])

  const updateTask = useCallback(async (id, data) => {
    const original = state.tasks.find(t => t.id === id) ?? {}
    const task = await taskService.updateTask(id, data, original)
    dispatch({ type: 'UPDATE_TASK', task })
    await fetchProjectById(String(task.projectId))
    return task
  }, [state.tasks, fetchProjectById])

  const moveTask = useCallback(async (id, newStatus, newOrder) => {
    const prevTask = state.tasks.find(t => t.id === id)
    dispatch({ type: 'MOVE_TASK_INSTANT', id, status: newStatus, order: newOrder })
    try {
      const task = await taskService.moveTask(id, newStatus, newOrder)
      dispatch({ type: 'UPDATE_TASK', task })
      if (prevTask) await fetchProjectById(String(prevTask.projectId))
      return task
    } catch (err) {
      if (prevTask) dispatch({ type: 'MOVE_TASK_INSTANT', id, status: prevTask.status, order: prevTask.columnOrder })
      throw err
    }
  }, [state.tasks, fetchProjectById])

  const deleteTask = useCallback(async (id) => {
    const task = state.tasks.find(t => t.id === id)
    await taskService.deleteTask(id)
    dispatch({ type: 'REMOVE_TASK', id })
    if (task) await fetchProjectById(String(task.projectId))
  }, [state.tasks, fetchProjectById])

  const loadComments = useCallback(async (taskId) => {
    const { data: comments } = await commentService.getCommentsForTask(taskId)
    dispatch({ type: 'LOAD_COMMENTS', taskId, comments })
    return comments
  }, [])

  const addComment = useCallback(async (taskId, content) => {
    const comment = await commentService.addComment(taskId, content)
    dispatch({ type: 'ADD_COMMENT', comment })
    return comment
  }, [])

  const updateComment = useCallback(async (id, content) => {
    const comment = await commentService.updateComment(id, content)
    dispatch({ type: 'UPDATE_COMMENT', comment })
    return comment
  }, [])

  const deleteComment = useCallback(async (id, taskId) => {
    await commentService.deleteComment(id)
    dispatch({ type: 'REMOVE_COMMENT', id, taskId })
  }, [])

  const getTasksForProject = useCallback((projectId) => {
    // projectId may come from useParams() (always a string) while t.projectId is
    // numeric from the API — compare as strings so this doesn't silently match nothing.
    return state.tasks.filter(t => String(t.projectId) === String(projectId))
  }, [state.tasks])

  return (
    <TaskContext.Provider value={{
      ...state,
      loadTasksForProject,
      createTask,
      updateTask,
      moveTask,
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
