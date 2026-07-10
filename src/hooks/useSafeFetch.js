import { useEffect, useRef } from 'react'

// Same job as `useEffect(() => { fn() }, deps)` but the ref guard blocks
// React StrictMode's mount→unmount→remount from firing `fn` twice in dev.
export function useSafeFetch(fn, deps = []) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
