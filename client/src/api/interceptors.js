/**
 * Interceptors Axios pour la gestion centralisée des requêtes/réponses
 */
import axiosInstance from './axios'
import { NOTIFICATION_TYPES } from '../config/constants'
import { ROUTES } from '../config/constants'

// Références globales (seront initialisées depuis main.js)
let routerInstance = null

/**
 * Initialise les interceptors avec l'instance Router
 * @param {Object} router - Instance Router Vue
 */
export function setupInterceptors(router) {
  routerInstance = router
  // Interceptor de requête
  axiosInstance.interceptors.request.use(
    (config) => {
      // Ajouter un timestamp pour éviter le cache
      config.metadata = { startTime: new Date() }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Interceptor de réponse
  axiosInstance.interceptors.response.use(
    (response) => {
      // Calculer le temps de réponse
      if (response.config.metadata) {
        const endTime = new Date()
        const duration = endTime - response.config.metadata.startTime
        console.debug(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
      }
      return response
    },
    async (error) => {
      if (!error.response) {
        // Erreur réseau
        handleNetworkError(error)
        return Promise.reject(error)
      }

      const { status, data } = error.response

      switch (status) {
        case 401:
          handleUnauthorized()
          break
        case 403:
          handleForbidden(data)
          break
        case 404:
          handleNotFound(data)
          break
        case 422:
          handleValidationError(data)
          break
        case 500:
          handleServerError(data)
          break
        default:
          handleGenericError(error, data)
      }

      return Promise.reject(error)
    }
  )
}

// Les notifications seront gérées par le service de notifications
// qui sera appelé depuis les composables. Ici on log juste les erreurs.
function handleNetworkError(error) {
  console.error('Network error:', error)
  // La notification sera gérée par le composable qui appelle l'API
}

function handleUnauthorized() {
  if (!routerInstance) return
  console.warn('Unauthorized - redirecting to login')
  routerInstance.push(ROUTES.LOGIN)
  // La notification sera gérée par le composable
}

function handleForbidden(data) {
  console.warn('Forbidden:', data?.error || 'Accès refusé')
  // La notification sera gérée par le composable
}

function handleNotFound(data) {
  console.warn('Not found:', data?.error || 'Ressource non trouvée')
  // La notification sera gérée par le composable
}

function handleValidationError(data) {
  console.warn('Validation error:', data?.error || data?.message || 'Erreur de validation')
  // La notification sera gérée par le composable
}

function handleServerError(data) {
  console.error('Server error:', data?.error || 'Erreur serveur')
  // La notification sera gérée par le composable
}

function handleGenericError(error, data) {
  console.error('Generic error:', data?.error || data?.message || error.message || 'Une erreur est survenue')
  // La notification sera gérée par le composable
}

export default setupInterceptors

