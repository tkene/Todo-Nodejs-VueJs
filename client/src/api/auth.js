import axiosInstance from './axios'

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials)
    return response.data
  } catch (error) {
    // Améliorer la gestion d'erreur pour mieux comprendre le problème
    console.error('Erreur de connexion:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
}

export const logout = async () => {
  const response = await axiosInstance.post('/api/auth/logout', {})
  return response.data
}

export const checkAuth = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      return { authenticated: false }
    }
    throw error
  }
}

export const register = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register', userData)
  return response.data
}
