import axiosInstance from './axios'

/**
 * Récupère les technologies disponibles (Vue.JS, PHP, Symfony)
 */
export const getTechnologies = async () => {
  const response = await axiosInstance.get('/api/elearning/technologies')
  return response.data
}

/**
 * Récupère tout le contenu d'apprentissage organisé par sections
 * @param {string} technology - La technologie choisie (Vue.JS, PHP, Symfony)
 */
export const getLearningContent = async (technology) => {
  const response = await axiosInstance.get(`/api/elearning/content?technology=${encodeURIComponent(technology)}`)
  return response.data
}

