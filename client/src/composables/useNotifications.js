/**
 * Composable pour les notifications
 */
import { notificationService } from '../services/notification.service'

export function useNotifications() {
  return {
    success: notificationService.success,
    error: notificationService.error,
    warning: notificationService.warning,
    info: notificationService.info
  }
}

export default useNotifications

