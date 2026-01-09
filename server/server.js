const { createApp } = require('./app');
const { SERVER_CONFIG, PATHS } = require('./config/app');
const { setDbReady } = require('./middleware/dbReady');
const { initDatabase } = require('./scripts/init-database');
const { setupErrorHandlers } = require('./middleware/errorHandler');

/**
 * Initialiser la base de données au démarrage
 * Cette initialisation est rapide et idempotente
 */
async function initializeDatabase() {
  try {
    await initDatabase();
    setDbReady();
    console.log('✅ Base de données prête.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    // Marquer comme prêt quand même pour éviter de bloquer indéfiniment
    setDbReady();
  }
}

function startServer() {
  // Créer l'application Express
  const app = createApp();

  // Configurer les gestionnaires d'erreurs process
  setupErrorHandlers();

  // Initialiser la base de données (asynchrone, ne bloque pas le démarrage)
  initializeDatabase();

  // Démarrer le serveur
  app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Backend listening on http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
    console.log(`📝 Environment: ${SERVER_CONFIG.NODE_ENV}`);
    console.log(`📁 Serving frontend from: ${PATHS.CLIENT_DIST}`);
    console.log('='.repeat(50));
  });
}

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  createApp,
};
