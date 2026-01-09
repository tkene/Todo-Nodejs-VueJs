/**
 * Configuration du middleware de sessions Express
 * Utilise connect-session-sequelize pour stocker les sessions dans MySQL
 * 
 * @module config/session
 */

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('../models');
const {
  SESSION_DURATION,
  COOKIE_CONFIG,
  STORE_CONFIG,
  MIDDLEWARE_CONFIG,
} = require('./session.constants');

/**
 * Crée et configure le store Sequelize pour les sessions
 * Le store cherche le modèle dans db.sequelize.models[STORE_CONFIG.MODEL_NAME]
 * 
 * @returns {SequelizeStore} Store configuré pour Sequelize
 */
function createSequelizeStore() {
  return new SequelizeStore({
    db: db.sequelize,
    table: STORE_CONFIG.MODEL_NAME,
    checkExpirationInterval: SESSION_DURATION.CHECK_INTERVAL,
    expiration: SESSION_DURATION.EXPIRATION,
  });
}

// Créer le store une seule fois (singleton)
const sequelizeStore = createSequelizeStore();

/**
 * Crée et configure le middleware express-session
 * 
 * @returns {Function} Middleware express-session configuré
 */
function createSessionMiddleware() {
  return session({
    store: sequelizeStore,
    secret: MIDDLEWARE_CONFIG.SECRET,
    resave: MIDDLEWARE_CONFIG.RESAVE,
    saveUninitialized: MIDDLEWARE_CONFIG.SAVE_UNINITIALIZED,
    cookie: {
      secure: COOKIE_CONFIG.SECURE,
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      maxAge: COOKIE_CONFIG.MAX_AGE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
    },
    name: COOKIE_CONFIG.NAME,
  });
}

// Créer le middleware de session
const sessionMiddleware = createSessionMiddleware();

// Attacher explicitement le store au middleware pour accès depuis init-database.js
// express-session n'expose pas automatiquement le store sur le middleware
sessionMiddleware.store = sequelizeStore;

module.exports = sessionMiddleware;

