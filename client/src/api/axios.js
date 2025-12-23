import axios from 'axios'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

// Créer une instance axios configurée avec withCredentials pour envoyer les cookies de session
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true, // Important pour envoyer les cookies de session
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
export { API }

