import axios from 'axios'
import { authState } from '../store/auth.js'
import { createApiLogger, logger } from '@shared/logger.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const EXCEL_BACKEND_URL = import.meta.env.VITE_EXCEL_BACKEND_URL || 'http://localhost:8004'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

const agentApi = axios.create({
  baseURL: EXCEL_BACKEND_URL,
  withCredentials: true,
})

createApiLogger('ExcelAgent', api)
createApiLogger('ExcelAgent', agentApi)

function authInterceptor(config) {
  if (authState.token) {
    config.headers.Authorization = `Bearer ${authState.token}`
  }
  return config
}

function mainApiErrorHandler(err) {
  if (err.response?.status === 401) {
    logger.warn('ExcelAgent', 'main API 401 detected, logging out')
    authState.logout()
    window.location.href = '/login'
  }
  return Promise.reject(err)
}

function agentApiErrorHandler(err) {
  if (err.response?.status === 401) {
    logger.warn('ExcelAgent', 'agent API 401 (expected with mock tokens)')
  }
  return Promise.reject(err)
}

api.interceptors.request.use(authInterceptor)
api.interceptors.response.use((res) => res, mainApiErrorHandler)

agentApi.interceptors.request.use(authInterceptor)
agentApi.interceptors.response.use((res) => res, agentApiErrorHandler)

export function authAPI() {
  const base = `${BASE_URL}/api/auth`
  return {
    login(email, password) {
      return axios.post(`${base}/login`, { email, password })
    },
    register(name, email, password) {
      return axios.post(`${base}/register`, { name, email, password })
    },
    forgotPassword(email) {
      return axios.post(`${base}/forgot-password`, { email })
    },
    resetPassword(token, password) {
      return axios.post(`${base}/reset-password`, { token, password })
    },
    me() {
      return api.get(`${base}/me`)
    },
  }
}

export function billingAPI() {
  const base = `${BASE_URL}/billing`
  return {
    getSubscription() { return api.get(`${base}/subscription`) },
    getUsage() { return api.get(`${base}/usage`) },
    getPlans() { return api.get(`${BASE_URL}/plans`) },
    createPortalSession() { return api.post(`${base}/portal`) },
  }
}

export function excelAPI() {
  return {
    generate(prompt, rows, formatType, conversationId) {
      return agentApi.post('/api/generate', { prompt, rows, format_type: formatType, conversation_id: conversationId })
    },
    refine(prompt, currentData, conversationId) {
      return agentApi.post('/api/refine', { prompt, current_data: currentData, conversation_id: conversationId })
    },
    research(prompt, columns, rowCount, conversationId) {
      return agentApi.post('/api/research', { prompt, columns, row_count: rowCount, conversation_id: conversationId })
    },
  }
}

export { agentApi }
export default api
