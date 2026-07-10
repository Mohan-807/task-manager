// Plain module-level store so axios interceptors (outside React) can drive it.
const listeners = new Set()

export const loaderStore = {
  show() {
    listeners.forEach((listener) => listener(true))
  },
  hide() {
    listeners.forEach((listener) => listener(false))
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
