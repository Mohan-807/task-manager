import axios from 'axios'
import { tokenService } from './tokenService'
import { loaderStore } from './loaderStore'

// Base URL and path prefix are read from env so both can change independently
// once the backend is deployed — nothing else in the app needs to change.
const API_URL = import.meta.env.VITE_API_URL ?? ''
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'
const BASE_URL = `${API_URL}${API_PREFIX}`

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// GET requests feed pages that already show their own skeleton/glassy-card
// loading state — only mutations (POST/PATCH/PUT/DELETE) drive the global loader.
function usesGlobalLoader(config) {
  return config.method?.toLowerCase() !== 'get'
}

apiClient.interceptors.request.use(
  (config) => {
    if (usesGlobalLoader(config)) loaderStore.show()
    const token = tokenService.getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    if (usesGlobalLoader(error.config ?? {})) loaderStore.hide()
    return Promise.reject(error)
  }
)

function normalizeError(error) {
  const detail = error.response?.data?.detail
  let message = error.message
  if (typeof detail === 'string') {
    message = detail
  } else if (Array.isArray(detail) && detail.length) {
    message = detail.map((d) => d.msg).join(', ')
  }
  return new Error(message)
}

// Concurrent 401s share a single in-flight refresh instead of each firing their own.
let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = tokenService.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')
  const response = await axios.post(`${BASE_URL}/auth/token/refresh`, {
    refresh_token: refreshToken,
  })
  tokenService.setTokens(response.data)
  return response.data.access_token
}

apiClient.interceptors.response.use(
  (response) => {
    if (usesGlobalLoader(response.config)) loaderStore.hide()
    return response
  },
  async (error) => {
    const { config, response } = error

    if (response?.status === 401 && config && !config._retry && tokenService.getRefreshToken()) {
      config._retry = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const accessToken = await refreshPromise
        refreshPromise = null
        config.headers.Authorization = `Bearer ${accessToken}`
        if (usesGlobalLoader(config)) loaderStore.hide() // settles the failed original call; retry's own request/response cycle tracks itself
        return apiClient(config)
      } catch (refreshError) {
        refreshPromise = null
        tokenService.clearTokens()
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        if (usesGlobalLoader(config ?? {})) loaderStore.hide()
        return Promise.reject(normalizeError(refreshError))
      }
    }

    if (usesGlobalLoader(config ?? {})) loaderStore.hide()
    return Promise.reject(normalizeError(error))
  }
)
