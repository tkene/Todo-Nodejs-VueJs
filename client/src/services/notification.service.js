/**
 * Service de notification centralisé
 */
import { useQuasar } from 'quasar'
import { NOTIFICATION_TYPES } from '../config/constants'

let $q = null

function getQuasarInstance() {
  if (!$q) {
    $q = useQuasar()
  }
  return $q
}

export const notificationService = {
  /**
   * Affiche une notification de succès
   */
  success(message, options = {}) {
    const $q = getQuasarInstance()
    return $q.notify({
      message,
      type: NOTIFICATION_TYPES.SUCCESS,
      icon: 'check',
      position: 'top-right',
      timeout: 2000,
      ...options
    })
  },

  /**
   * Affiche une notification d'erreur
   */
  error(message, options = {}) {
    const $q = getQuasarInstance()
    return $q.notify({
      message,
      type: NOTIFICATION_TYPES.ERROR,
      icon: 'error',
      position: 'top-right',
      timeout: 4000,
      ...options
    })
  },

  /**
   * Affiche une notification d'avertissement
   */
  warning(message, options = {}) {
    const $q = getQuasarInstance()
    return $q.notify({
      message,
      type: NOTIFICATION_TYPES.WARNING,
      icon: 'warning',
      position: 'top-right',
      timeout: 3000,
      ...options
    })
  },

  /**
   * Affiche une notification d'information
   */
  info(message, options = {}) {
    const $q = getQuasarInstance()
    return $q.notify({
      message,
      type: NOTIFICATION_TYPES.INFO,
      icon: 'info',
      position: 'top-right',
      timeout: 3000,
      ...options
    })
  }
}

export default notificationService

