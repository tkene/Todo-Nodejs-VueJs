/**
 * Configuration centralisée de l'application
 */
export const appConfig = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000'),
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Application Configuration
  app: {
    name: 'Job Tracker',
    version: '1.0.0',
    locale: 'fr-FR',
    dateFormat: 'fr-FR'
  },

  // UI Configuration
  ui: {
    sidebarWidth: 200,
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableAnalytics: false,
    enableErrorTracking: true
  }
}

export default appConfig

