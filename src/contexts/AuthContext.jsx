import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { authService } from '@/services/authService'
import { storage } from '@/services/storageService'

const AuthContext = createContext(null)

const initialState = {
  user:    null,
  loading: true,
  error:   null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_DONE':    return { ...state, user: action.user, loading: false }
    case 'LOGIN_START':  return { ...state, loading: true, error: null }
    case 'LOGIN_OK':     return { ...state, user: action.user, loading: false, error: null }
    case 'LOGIN_FAIL':   return { ...state, loading: false, error: action.error }
    case 'LOGOUT':       return { ...state, user: null, loading: false, error: null }
    case 'UPDATE_USER':  return { ...state, user: action.user }
    case 'CLEAR_ERROR':  return { ...state, error: null }
    default:             return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    storage.init()
    const saved = storage.getCurrentUser()
    dispatch({ type: 'INIT_DONE', user: saved })
  }, [])

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const user = await authService.login(email, password)
      dispatch({ type: 'LOGIN_OK', user })
      return { ok: true, user }
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL', error: err.message })
      return { ok: false, error: err.message }
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateProfile = useCallback(async (data) => {
    if (!state.user) return
    const updated = await authService.updateProfile(state.user.id, data)
    dispatch({ type: 'UPDATE_USER', user: updated })
    return updated
  }, [state.user])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
