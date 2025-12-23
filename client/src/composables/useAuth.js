import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { login as loginApi, logout as logoutApi, checkAuth as checkAuthApi, register as registerApi } from '../api/auth'

const isAuthenticated = ref(false)
const user = ref(null)
const isLoading = ref(false)

export function useAuth() {
  const router = useRouter()
  const $q = useQuasar()

  /**
   * Vérifie l'état de l'authentification
   */
  const checkAuth = async () => {
    try {
      isLoading.value = true
      const authStatus = await checkAuthApi()
      
      if (authStatus.authenticated) {
        isAuthenticated.value = true
        user.value = {
          id: authStatus.userId,
          email: authStatus.email
        }
        return true
      } else {
        isAuthenticated.value = false
        user.value = null
        return false
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      isAuthenticated.value = false
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await loginApi(credentials)
      
      if (response.success) {
        isAuthenticated.value = true
        user.value = {
          id: response.user.id,
          email: response.user.email
        }
        
        $q.notify({
          message: response.message || 'Connexion réussie !',
          color: 'positive',
          icon: 'check',
          position: 'top-right',
          timeout: 2000
        })
        
        return { success: true, user: response.user }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Une erreur est survenue lors de la connexion.'
      
      $q.notify({
        message: errorMessage,
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      })
      
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Déconnexion d'un utilisateur
   */
  const logout = async () => {
    try {
      isLoading.value = true
      await logoutApi()
      
      isAuthenticated.value = false
      user.value = null
      
      $q.notify({
        message: 'Déconnexion réussie',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      $q.notify({
        message: 'Erreur lors de la déconnexion',
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (userData) => {
    try {
      isLoading.value = true
      const response = await registerApi(userData)
      
      if (response.success) {
        isAuthenticated.value = true
        user.value = {
          id: response.user.id,
          email: response.user.email
        }
        
        $q.notify({
          message: response.message || 'Inscription réussie !',
          color: 'positive',
          icon: 'check',
          position: 'top-right',
          timeout: 2000
        })
        
        return { success: true, user: response.user }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.'
      
      $q.notify({
        message: errorMessage,
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      })
      
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // État
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    
    // Méthodes
    checkAuth,
    login,
    logout,
    register
  }
}

export default useAuth
