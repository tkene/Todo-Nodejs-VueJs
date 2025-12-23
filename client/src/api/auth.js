import axiosInstance from './axios'

export const login = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials)
  return response.data
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
