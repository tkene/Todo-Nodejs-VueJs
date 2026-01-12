/**
 * Configuration de l'application Express
 * 
 * @module config/app
 */

const path = require('path');

/**
 * Configuration du serveur
 */
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

/**
 * Chemins de l'application
 */
const PATHS = {
  CLIENT_DIST: path.join(__dirname, '../../client/dist'),
  ROOT: path.join(__dirname, '../..'),
};

/**
 * Vérifier si l'application est en production
 * @returns {boolean}
 */
function isProduction() {
  return SERVER_CONFIG.NODE_ENV === 'production';
}

/**
 * Vérifier si l'application est en développement
 * @returns {boolean}
 */
function isDevelopment() {
  return SERVER_CONFIG.NODE_ENV === 'development';
}

module.exports = {
  SERVER_CONFIG,
  PATHS,
  isProduction,
  isDevelopment,
};

