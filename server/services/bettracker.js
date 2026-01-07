/**
 * Service d'intégration avec l'API BetTracker Pro
 * Documentation: https://bettracker.io/docs/api
 */

const axios = require('axios');

// Configuration de l'API BetTracker
// Base URL selon les exemples officiels : https://bettracker.io/docs/examples
// Documentation: https://bettracker.io/docs/api
const BETTRACKER_API_BASE_URL = process.env.BETTRACKER_API_BASE_URL || 'https://bettracker.io/api';
const API_KEY = process.env.BETTRACKER_API_KEY || '';

/**
 * Exécute un outil de l'API BetTracker
 * Tous les endpoints utilisent POST /tools/execute avec tool et arguments
 * @param {string} tool - Nom de l'outil à exécuter (ex: 'get_today_races')
 * @param {Object} arguments - Arguments pour l'outil
 * @returns {Promise} Réponse de l'API
 */
async function executeTool(tool, arguments = {}) {
  if (!API_KEY) {
    throw new Error('BETTRACKER_API_KEY n\'est pas configurée. Veuillez définir la variable d\'environnement.');
  }
  
  try {
    // URL complète selon les exemples officiels : https://bettracker.io/api/tools/execute
    const endpoint = `${BETTRACKER_API_BASE_URL}/tools/execute`;
    
    console.log(`[BETTRACKER] Appel API: ${endpoint}`);
    console.log(`[BETTRACKER] Tool: ${tool}, Arguments:`, JSON.stringify(arguments, null, 2));
    
    const response = await axios({
      method: 'POST',
      url: endpoint,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        tool,
        arguments
      },
      timeout: 30000, // 30 secondes selon la doc
      validateStatus: function (status) {
        return status < 500; // Ne pas throw pour les 4xx, laisser axios gérer
      }
    });
    
    // Vérifier le status
    if (response.status === 404) {
      const errorMsg = `Endpoint non trouvé (404). URL: ${endpoint}\n` +
        `Vérifiez que:\n` +
        `1. Votre compte BetTracker Pro a accès à l'API\n` +
        `2. L'API est activée dans vos paramètres\n` +
        `3. Votre clé API est valide et active`;
      throw new Error(errorMsg);
    }
    
    if (response.status === 401) {
      throw new Error(`Authentification échouée (401). Vérifiez que votre clé API est correcte.`);
    }
    
    if (response.status !== 200) {
      throw new Error(`Erreur HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
    
    // Vérifier la structure de la réponse selon les exemples
    if (!response.data) {
      throw new Error('Réponse vide de l\'API');
    }
    
    // La réponse peut être directement les data ou avoir une structure { success, data }
    if (response.data.success === false) {
      throw new Error(response.data.error || response.data.message || 'Erreur lors de l\'exécution de l\'outil');
    }
    
    // Retourner les données (soit directement, soit dans response.data.data)
    return response.data.data || response.data;
  } catch (error) {
    console.error('[BETTRACKER] Erreur API:', {
      tool,
      url: error.config?.url || endpoint,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Améliorer le message d'erreur
    if (error.response?.status === 404) {
      error.message = `Endpoint non trouvé. Vérifiez que votre compte a accès à l'API BetTracker Pro.\n` +
        `URL utilisée: ${error.config?.url}\n` +
        `Consultez: https://bettracker.io/docs/api`;
    }
    
    throw error;
  }
}

/**
 * Récupère les courses du jour
 * @returns {Promise<Array>} Liste des courses du jour
 */
async function getTodayRaces() {
  try {
    const races = await executeTool('get_today_races', {});
    return Array.isArray(races) ? races : [];
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération des courses du jour:', error.message);
    throw new Error(`Impossible de récupérer les courses du jour: ${error.message}`);
  }
}

/**
 * Recherche des courses selon des critères
 * @param {Object} options - Options de recherche
 * @param {string} options.hippodrome_code - Code de l'hippodrome (ex: 'M3')
 * @param {string} options.date - Date au format YYYY-MM-DD
 * @returns {Promise<Array>} Liste des courses trouvées
 */
async function searchRaces(options = {}) {
  try {
    const races = await executeTool('search_races', options);
    return Array.isArray(races) ? races : [];
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la recherche de courses:', error.message);
    throw new Error(`Impossible de rechercher les courses: ${error.message}`);
  }
}

/**
 * Récupère les courses disponibles pour une date donnée
 * @param {string} date - Date au format YYYY-MM-DD (optionnel, défaut: aujourd'hui)
 * @returns {Promise<Array>} Liste des courses
 */
async function getRaces(date = null) {
  try {
    if (date) {
      // Rechercher les courses pour une date spécifique
      return await searchRaces({ date });
    } else {
      // Récupérer les courses du jour
      return await getTodayRaces();
    }
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération des courses:', error.message);
    throw new Error(`Impossible de récupérer les courses: ${error.message}`);
  }
}

/**
 * Analyse une course PMU spécifique
 * @param {Object} options - Options d'analyse
 * @param {string} options.hippodrome_code - Code de l'hippodrome (ex: 'M3')
 * @param {number} options.race_number - Numéro de la course
 * @param {string} options.date - Date au format YYYY-MM-DD
 * @returns {Promise<Object>} Analyse complète de la course avec les chevaux
 */
async function getRaceAnalysis(options) {
  try {
    const { hippodrome_code, race_number, date } = options;
    
    if (!hippodrome_code || !race_number || !date) {
      throw new Error('hippodrome_code, race_number et date sont requis');
    }
    
    const analysis = await executeTool('get_pmu_race_analysis', {
      hippodrome_code,
      race_number,
      date
    });
    
    return analysis;
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de l\'analyse de la course:', error.message);
    throw new Error(`Impossible d'analyser la course: ${error.message}`);
  }
}

/**
 * Récupère les détails d'une course spécifique
 * Utilise get_pmu_race_analysis pour obtenir les détails complets
 * @param {string|Object} raceIdOrOptions - Identifiant de la course ou options {hippodrome_code, race_number, date}
 * @returns {Promise<Object>} Détails de la course avec les chevaux
 */
async function getRaceDetails(raceIdOrOptions) {
  try {
    // Si c'est un objet avec les options, utiliser directement
    if (typeof raceIdOrOptions === 'object') {
      return await getRaceAnalysis(raceIdOrOptions);
    }
    
    // Sinon, essayer de parser l'ID (format à adapter selon la structure des IDs)
    // Pour l'instant, on suppose que l'ID contient les infos nécessaires
    // À adapter selon la structure réelle des IDs retournés par l'API
    throw new Error('Format d\'ID non supporté. Utilisez {hippodrome_code, race_number, date}');
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération des détails de la course:', error.message);
    throw new Error(`Impossible de récupérer les détails de la course: ${error.message}`);
  }
}

/**
 * Récupère les données du quinté+ du jour
 * @returns {Promise<Object>} Données complètes de la course quinté+ du jour
 */
async function getQuinteDuJour() {
  try {
    // Récupérer les courses du jour
    const races = await getTodayRaces();
    
    if (!races || races.length === 0) {
      throw new Error('Aucune course trouvée pour aujourd\'hui');
    }
    
    // Filtrer pour trouver le quinté (généralement la première course ou celle avec le plus de partants)
    const quinteRace = races.find(race => 
      race.type === 'quinte' || 
      race.name?.toLowerCase().includes('quinté') ||
      (race.nbPartants && race.nbPartants >= 14)
    ) || races[0];
    
    if (!quinteRace) {
      throw new Error('Aucune course quinté+ trouvée pour aujourd\'hui');
    }
    
    // Récupérer l'analyse complète si on a les infos nécessaires
    if (quinteRace.hippodrome_code && quinteRace.race_number && quinteRace.date) {
      const raceAnalysis = await getRaceAnalysis({
        hippodrome_code: quinteRace.hippodrome_code,
        race_number: quinteRace.race_number,
        date: quinteRace.date
      });
      return raceAnalysis;
    }
    
    // Sinon, retourner les données de base
    return quinteRace;
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération du quinté du jour:', error.message);
    throw error;
  }
}

/**
 * Récupère les pronostics IA
 * @param {Object} options - Options de récupération
 * @param {string} options.status - Statut des pronostics ('validated', etc.)
 * @returns {Promise<Array>} Liste des pronostics IA
 */
async function getAIPronostics(options = {}) {
  try {
    const pronostics = await executeTool('get_ai_pronostics', options);
    return Array.isArray(pronostics) ? pronostics : [];
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération des pronostics IA:', error.message);
    throw new Error(`Impossible de récupérer les pronostics IA: ${error.message}`);
  }
}

/**
 * Récupère les statistiques utilisateur
 * @param {Object} options - Options de récupération
 * @param {string} options.period - Période ('month', 'week', 'year', etc.)
 * @returns {Promise<Object>} Statistiques utilisateur
 */
async function getUserStats(options = {}) {
  try {
    const stats = await executeTool('get_user_stats', options);
    return stats;
  } catch (error) {
    console.error('[BETTRACKER] Erreur lors de la récupération des stats utilisateur:', error.message);
    throw new Error(`Impossible de récupérer les stats utilisateur: ${error.message}`);
  }
}

module.exports = {
  executeTool,
  getTodayRaces,
  searchRaces,
  getRaces,
  getRaceAnalysis,
  getRaceDetails,
  getQuinteDuJour,
  getAIPronostics,
  getUserStats
};

