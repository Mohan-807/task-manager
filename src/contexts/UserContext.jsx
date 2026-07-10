import { createContext, useContext, useReducer, useCallback } from 'react'
import { userService } from '@/services/userService'

const UserContext = createContext(null)

const initialState = {
  users:   [],
  loading: false,
  error:   null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':  return { ...state, loading: true, error: null }
    case 'LOAD_OK':     return { ...state, users: action.users, loading: false }
    case 'LOAD_FAIL':   return { ...state, loading: false, error: action.error }
    case 'ADD':         return { ...state, users: [action.user, ...state.users] }
    case 'UPDATE':      return { ...state, users: state.users.map(u => u.id === action.user.id ? action.user : u) }
    case 'REMOVE':      return { ...state, users: state.users.filter(u => u.id !== action.id) }
    default:            return state
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadUsers = useCallback(async () => {
    dispatch({ type: 'LOAD_START' })
    try {
      const { data: users } = await userService.getUsers()
      dispatch({ type: 'LOAD_OK', users })
    } catch (err) {
      dispatch({ type: 'LOAD_FAIL', error: err.message })
    }
  }, [])

  const createUser = useCallback(async (data) => {
    const user = await userService.createUser(data)
    dispatch({ type: 'ADD', user })
    return user
  }, [])

  const updateUser = useCallback(async (id, data) => {
    const user = await userService.updateUser(id, data)
    dispatch({ type: 'UPDATE', user })
    return user
  }, [])

  const deleteUser = useCallback(async (id) => {
    await userService.deleteUser(id)
    dispatch({ type: 'REMOVE', id })
  }, [])

  const inviteUser = useCallback(async (data) => {
    const user = await userService.inviteUser(data)
    dispatch({ type: 'ADD', user })
    return user
  }, [])

  const getUserById = useCallback((id) => {
    // id may come from a route param or other string boundary while u.id is
    // numeric from the API — compare as strings defensively.
    return state.users.find(u => String(u.id) === String(id)) ?? null
  }, [state.users])

  // Sync a single user update from outside (e.g. project member changes)
  const syncUsers = useCallback(() => {
    userService.getUsers().then(({ data: users }) => dispatch({ type: 'LOAD_OK', users }))
  }, [])

  return (
    <UserContext.Provider value={{
      ...state,
      loadUsers,
      createUser,
      updateUser,
      deleteUser,
      inviteUser,
      getUserById,
      syncUsers,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUsers must be used within UserProvider')
  return ctx
}
