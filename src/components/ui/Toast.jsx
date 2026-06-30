import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const STYLES = {
  success: 'bg-white border-emerald-200 text-emerald-700',
  error:   'bg-white border-red-200 text-red-700',
  warning: 'bg-white border-amber-200 text-amber-700',
  info:    'bg-white border-blue-200 text-blue-700',
}

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

export default function Toast({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(show)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onRemove(id), 300)
  }

  const Icon = ICONS[type] ?? Info

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full',
        'transition-all duration-300',
        STYLES[type],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', ICON_STYLES[type])} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-gray-800">{title}</p>}
        {message && <p className="text-sm text-gray-600 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
