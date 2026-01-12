/**
 * Constantes de configuration pour les sessions
 * Centralise toutes les valeurs de configuration pour faciliter la maintenance
 */

// Durées en millisecondes
const SESSION_DURATION = {
  EXPIRATION: 24 * 60 * 60 * 1000, // 24 heures
  CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutes
};

// Configuration du cookie de session
const COOKIE_CONFIG = {
  HTTP_ONLY: true, // Empêche l'accès via JavaScript
  SECURE: process.env.NODE_ENV === 'production', // HTTPS en production
  MAX_AGE: SESSION_DURATION.EXPIRATION,
  SAME_SITE: 'lax', // Protection CSRF
  NAME: 'sessionId', // Nom du cookie
};

// Configuration du store Sequelize
const STORE_CONFIG = {
  TABLE_NAME: 'sessions', // Nom de la table dans la base de données
  MODEL_NAME: 'sessions', // Nom du modèle dans sequelize.models (pour connect-session-sequelize)
};

// Configuration du middleware express-session
const MIDDLEWARE_CONFIG = {
  RESAVE: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  SAVE_UNINITIALIZED: false, // Ne pas créer de session pour les requêtes non authentifiées
  SECRET: process.env.SESSION_SECRET || 'votre-secret-session-changez-moi-en-production',
};

module.exports = {
  SESSION_DURATION,
  COOKIE_CONFIG,
  STORE_CONFIG,
  MIDDLEWARE_CONFIG,
};

