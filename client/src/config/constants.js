/**
 * Constantes de l'application
 */

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  JOB_ALERTS: '/job-alerts',
  JOB_DETAILS: '/job-details',
  TODO: '/todo',
  TAGS: '/configuration/tags',
  NOT_FOUND: '/404'
}

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme'
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    CHECK: '/auth/check'
  },
  JOBS: {
    BASE: '/jobs',
    COMMENTS: (jobId) => `/jobs/${jobId}/comments`
  },
  TODOS: {
    BASE: '/todos'
  },
  TAGS: {
    BASE: '/tags'
  }
}

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'positive',
  ERROR: 'negative',
  WARNING: 'warning',
  INFO: 'info'
}

// Date Formats
export const DATE_FORMATS = {
  SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
  LONG: { year: 'numeric', month: 'long', day: 'numeric' },
  DATETIME: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
}

export default {
  ROUTES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  NOTIFICATION_TYPES,
  DATE_FORMATS
}

