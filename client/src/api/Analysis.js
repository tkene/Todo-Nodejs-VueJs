import axiosInstance from './axios'

/**
 * Récupère la liste des courses disponibles
 * @param {string} date - Date au format YYYY-MM-DD (optionnel, défaut: aujourd'hui)
 */
export const getAvailableRaces = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await axiosInstance.get('/api/analysis/races', { params })
    
    // S'assurer que la réponse est toujours un tableau
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('L\'API n\'a pas retourné un tableau:', response.data);
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

/**
 * Lance l'analyse d'une course
 * @param {string} courseId - Identifiant de la course (ex: "R1C8")
 * @returns {Promise} Résultat de l'analyse avec top3, expertInsight, smartMoneyAlerts
 */
export const analyzeRace = async (courseId) => {
  const response = await axiosInstance.post('/api/analysis/analyze', { 
    courseId
  })
  return response.data
}

/**
 * Évalue une course avec calcul de probabilités
 * @param {string} courseId - Identifiant de la course (ex: "R1C8")
 * @returns {Promise} Résultat de l'évaluation avec probabilités
 */
export const evaluateRace = async (courseId) => {
  const response = await axiosInstance.post('/api/analysis/evaluate', { courseId })
  return response.data
}

/**
 * Récupère les courses depuis BetTracker
 * @param {string} date - Date au format YYYY-MM-DD (optionnel)
 * @returns {Promise} Liste des courses
 */
export const getBetTrackerRaces = async (date = null) => {
  const params = date ? { date } : {};
  const response = await axiosInstance.get('/api/analysis/bettracker/races', { params });
  return response.data;
}

/**
 * Récupère le quinté+ du jour depuis BetTracker
 * @returns {Promise} Données du quinté+ du jour
 */
export const getBetTrackerQuinteDuJour = async () => {
  const response = await axiosInstance.get('/api/analysis/bettracker/quinte-du-jour');
  return response.data;
}

/**
 * Récupère les détails d'une course depuis BetTracker
 * @param {string} raceId - Identifiant de la course
 * @returns {Promise} Détails de la course
 */
export const getBetTrackerRaceDetails = async (raceId) => {
  const response = await axiosInstance.get(`/api/analysis/bettracker/race/${raceId}`);
  return response.data;
}

