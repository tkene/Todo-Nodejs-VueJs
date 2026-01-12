/**
 * Configuration de l'application Express
 * Séparation de la logique de configuration du point d'entrée
 * 
 * @module app
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getCorsOptions } = require('./config/cors');
const sessionConfig = require('./config/session');
const { waitForDb } = require('./middleware/dbReady');
const { setupRoutes } = require('./routes');
const { setupStaticFiles } = require('./middleware/staticFiles');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

/**
 * Créer et configurer l'application Express
 * 
 * @returns {Express} Application Express configurée
 */
function createApp() {
  const app = express();

  // Configuration CORS
  app.use(cors(getCorsOptions()));

  // Parser JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check (accessible même si DB n'est pas prête)
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
    });
  });

  // Middleware pour attendre que la base de données soit prête
  app.use(waitForDb);

  // Middleware de sessions (après waitForDb)
  app.use(sessionConfig);

  // Routes API
  setupRoutes(app);

  // Fichiers statiques et catch-all pour Vue Router
  setupStaticFiles(app);

  // Gestion des erreurs (doit être le dernier middleware)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

