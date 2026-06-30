import { createContext, useContext, useCallback, useReducer } from 'react'
import { createPortal } from 'react-dom'
import Toast from '@/components/ui/Toast'

const NotificationContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast]
    case 'REMOVE': return state.filter(t => t.id !== action.id)
    default:       return state
  }
}

export function NotificationProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const notify = useCallback((type, title, message, duration = 4000) => {
    const id = `toast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`
    dispatch({ type: 'ADD', toast: { id, type, title, message } })
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => dispatch({ type: 'REMOVE', id }), [])

  const toast = {
    success: (title, message, duration) => notify('success', title, message, duration),
    error:   (title, message, duration) => notify('error',   title, message, duration),
    warning: (title, message, duration) => notify('warning', title, message, duration),
    info:    (title, message, duration) => notify('info',    title, message, duration),
  }

  return (
    <NotificationContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onRemove={remove} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
