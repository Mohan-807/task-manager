import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { loaderStore } from '@/services/loaderStore'

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false)

  useEffect(() => loaderStore.subscribe(setLoading), [])

  if (!loading) return null

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>,
    document.body
  )
}
