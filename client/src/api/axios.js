import axios from 'axios'
import { appConfig } from '../config/app.config'

// Créer une instance axios configurée avec withCredentials pour envoyer les cookies de session
const axiosInstance = axios.create({
  baseURL: appConfig.api.baseURL,
  timeout: appConfig.api.timeout,
  withCredentials: true, // Important pour envoyer les cookies de session
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
export { appConfig }

