/**
 * Middleware pour attendre que la base de données soit prête
 * avant de traiter les requêtes
 */

let dbReady = false;

/**
 * Marquer la base de données comme prête
 */
function setDbReady() {
  dbReady = true;
}

/**
 * Vérifier si la base de données est prête
 */
function isDbReady() {
  return dbReady;
}

/**
 * Middleware Express pour attendre que la DB soit prête
 */
function waitForDb(req, res, next) {
  // Permettre les requêtes de health check même si la DB n'est pas prête
  if (req.path === '/health') {
    return next();
  }

  if (!dbReady) {
    // Attendre un peu et réessayer
    setTimeout(() => {
      if (dbReady) {
        next();
      } else {
        res.status(503).json({ 
          error: 'Service en cours d\'initialisation, veuillez réessayer dans quelques instants' 
        });
      }
    }, 100);
  } else {
    // La base de données est prête, continuer
    next();
  }
}

module.exports = {
  waitForDb,
  setDbReady,
  isDbReady
};

