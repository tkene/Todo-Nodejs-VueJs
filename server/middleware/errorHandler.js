/**
 * Middleware de gestion des erreurs
 * 
 * @module middleware/errorHandler
 */

/**
 * Middleware de gestion des erreurs Express
 * Doit être le dernier middleware monté
 * 
 * @param {Error} err - Erreur
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  // Log de l'erreur
  console.error('❌ Erreur:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Réponse d'erreur
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Erreur interne du serveur'
    : err.message;

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 * 
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Next middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      message: `Route non trouvée: ${req.method} ${req.path}`,
    },
  });
}

/**
 * Gestionnaire d'erreurs pour les promesses non résolues
 */
function setupUnhandledRejectionHandler() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // En production, on pourrait envoyer une notification
    // Pour l'instant, on log juste l'erreur
  });
}

/**
 * Gestionnaire d'erreurs pour les exceptions non capturées
 */
function setupUncaughtExceptionHandler() {
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Fermer proprement le serveur
    process.exit(1);
  });
}

/**
 * Configurer tous les gestionnaires d'erreurs
 */
function setupErrorHandlers() {
  setupUnhandledRejectionHandler();
  setupUncaughtExceptionHandler();
}

module.exports = {
  errorHandler,
  notFoundHandler,
  setupErrorHandlers,
};

