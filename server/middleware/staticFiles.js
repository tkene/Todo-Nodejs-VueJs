/**
 * Configuration pour servir les fichiers statiques du frontend
 * 
 * @module middleware/staticFiles
 */

const express = require('express');
const path = require('path');
const { PATHS } = require('../config/app');

/**
 * Configurer le serveur de fichiers statiques pour le frontend Vue.js
 * 
 * @param {Express} app - Instance Express
 */
function setupStaticFiles(app) {
  const clientPath = PATHS.CLIENT_DIST;

  // Servir les fichiers statiques
  app.use(express.static(clientPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
  }));

  // Pour toutes les autres routes, servir index.html (pour Vue Router)
  // Cette route doit être la dernière avant les gestionnaires d'erreurs
  app.get('*', (req, res, next) => {
    // Ignorer les routes API
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    res.sendFile(path.join(clientPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

module.exports = {
  setupStaticFiles,
};

