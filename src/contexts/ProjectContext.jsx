import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { projectService } from '@/services/projectService'

const ProjectContext = createContext(null)

const initialState = {
  projects: [],
  loading:  false,
  error:    null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START': return { ...state, loading: true, error: null }
    case 'LOAD_OK':    return { ...state, projects: action.projects, loading: false }
    case 'LOAD_FAIL':  return { ...state, loading: false, error: action.error }
    case 'ADD':        return { ...state, projects: [action.project, ...state.projects] }
    case 'UPDATE':     return {
      ...state,
      projects: state.projects.some(p => p.id === action.project.id)
        ? state.projects.map(p => p.id === action.project.id ? action.project : p)
        : [...state.projects, action.project],
    }
    case 'REMOVE':     return { ...state, projects: state.projects.filter(p => p.id !== action.id) }
    default: return state
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadProjects = useCallback(async () => {
    dispatch({ type: 'LOAD_START' })
    try {
      const { data: projects } = await projectService.getProjects()
      dispatch({ type: 'LOAD_OK', projects })
    } catch (err) {
      dispatch({ type: 'LOAD_FAIL', error: err.message })
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const createProject = useCallback(async (data) => {
    const project = await projectService.createProject(data)
    dispatch({ type: 'ADD', project })
    return project
  }, [])

  const updateProject = useCallback(async (id, data) => {
    const project = await projectService.updateProject(id, data)
    dispatch({ type: 'UPDATE', project })
    return project
  }, [])

  const deleteProject = useCallback(async (id) => {
    await projectService.deleteProject(id)
    dispatch({ type: 'REMOVE', id })
  }, [])

  const addMember = useCallback(async (projectId, userId) => {
    await projectService.addMember(projectId, userId)
    const project = await projectService.getProjectById(projectId)
    dispatch({ type: 'UPDATE', project })
    return project
  }, [])

  const removeMember = useCallback(async (projectId, userId) => {
    await projectService.removeMember(projectId, userId)
    const project = await projectService.getProjectById(projectId)
    dispatch({ type: 'UPDATE', project })
    return project
  }, [])

  const getProjectById = useCallback((id) => {
    // id may come from useParams() (string) while p.id is numeric from the API.
    return state.projects.find(p => String(p.id) === String(id)) ?? null
  }, [state.projects])

  // Fetches a single project from the API and upserts it into state — needed for
  // direct links / hard refreshes on /projects/:id, where the full list hasn't
  // loaded (or won't ever include it, e.g. a manager linked into a project they
  // don't own) by the time the detail page mounts.
  const fetchProjectById = useCallback(async (id) => {
    const project = await projectService.getProjectById(id)
    dispatch({ type: 'UPDATE', project })
    return project
  }, [])

  return (
    <ProjectContext.Provider value={{
      ...state,
      loadProjects,
      createProject,
      updateProject,
      deleteProject,
      addMember,
      removeMember,
      getProjectById,
      fetchProjectById,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}
