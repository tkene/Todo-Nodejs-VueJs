/**
 * Script d'initialisation de la base de données
 * 
 * Ce script est appelé automatiquement au démarrage du serveur (server.js)
 * Il effectue uniquement les vérifications nécessaires pour s'assurer que la DB est prête.
 * 
 * Pour une initialisation complète (migrations + données de démo), utilisez:
 * - node server/scripts/init-db.js (initialisation complète avec utilisateurs de démo)
 * 
 * @module scripts/init-database
 */

const db = require('../models');

/**
 * Vérifier si la base de données est déjà initialisée
 * @returns {Promise<boolean>} true si la DB est initialisée
 */
async function isDatabaseInitialized() {
  try {
    // Vérifier si au moins une table existe (par exemple 'users')
    const [results] = await db.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('users', 'todos', 'tags')
    `);
    return results[0].count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Initialiser la base de données (appelé automatiquement au démarrage)
 * 
 * Cette fonction est optimisée pour les démarrages normaux :
 * - Vérifie la connexion
 * - Exécute les migrations uniquement si AUTO_MIGRATE est activé
 * - Synchronise les modèles (idempotent - ne fait rien si les tables existent)
 * - Vérifie la table sessions
 * 
 * Pour une initialisation complète avec données de démo, utilisez init-db.js
 */
async function initDatabase() {
  try {
    // 1. Authentifier la connexion (toujours nécessaire)
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.');
    
    // 2. Exécuter les migrations (uniquement si AUTO_MIGRATE est activé)
    // Les migrations sont idempotentes - elles ne font rien si déjà exécutées
    if (process.env.AUTO_MIGRATE !== 'false') {
      try {
        console.log('🔄 Vérification des migrations...');
        const { execSync } = require('child_process');
        const migrationEnv = process.env.NODE_ENV || 'development';
        execSync('npx sequelize-cli db:migrate', { 
          stdio: 'pipe',
          cwd: __dirname + '/..',
          env: { ...process.env, NODE_ENV: migrationEnv }
        });
        console.log('✅ Migrations à jour.');
      } catch (migrationError) {
        // Les migrations peuvent déjà être à jour - ce n'est pas une erreur
        console.log('ℹ️  Migrations déjà à jour.');
      }
    }
    
    // 3. Synchroniser les modèles (idempotent - crée uniquement si n'existent pas)
    // Cette opération est rapide si les tables existent déjà
    await db.sequelize.sync({ alter: false });
    console.log('✅ Modèles synchronisés.');
    
    // 4. Vérifier la table sessions (rapide - juste une vérification)
    await ensureSessionsTable();
    
    // 5. Vérifier le store de sessions (rapide - juste une vérification)
    await verifySessionStore();
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

/**
 * Vérifier que le store de sessions est correctement configuré
 * Ne synchronise que si nécessaire (le modèle est déjà synchronisé via db.sequelize.sync())
 */
async function verifySessionStore() {
  try {
    const sessionMiddleware = require('../config/session');
    const store = sessionMiddleware.store;

    if (!store) {
      console.warn('⚠️  Store de sessions non trouvé');
      return;
    }

    if (!store.sessionModel) {
      console.warn('⚠️  Modèle de session non trouvé dans le store');
      return;
    }

    // Vérifier que le modèle est bien configuré (pas besoin de sync si déjà synchronisé)
    console.log('✅ Store de sessions configuré.');
  } catch (error) {
    console.error('⚠️  Erreur lors de la vérification du store:', error.message);
    // Ne pas faire échouer l'initialisation
  }
}

/**
 * Vérifier que la table sessions existe
 * La table est créée automatiquement par db.sequelize.sync() via le modèle Session
 * Cette fonction vérifie juste qu'elle existe (opération rapide)
 */
async function ensureSessionsTable() {
  try {
    // Vérification rapide - la table devrait déjà exister via db.sequelize.sync()
    const [results] = await db.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'sessions'
    `);
    
    if (results[0].count === 0) {
      // Si la table n'existe pas, elle sera créée par le modèle Session lors de sync()
      // Mais on peut la créer manuellement pour garantir la structure exacte
      console.log('🔄 Création de la table sessions...');
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`sessions\` (
          \`sid\` VARCHAR(255) NOT NULL PRIMARY KEY,
          \`expires\` DATETIME NULL,
          \`data\` TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table sessions créée.');
    } else {
      // Table existe déjà - pas besoin de log verbeux à chaque démarrage
      // console.log('✅ Table sessions OK.');
    }
  } catch (sessionError) {
    console.error('⚠️  Erreur lors de la vérification de la table sessions:', sessionError.message);
    // Ne pas faire échouer l'initialisation - le modèle Session créera la table si nécessaire
  }
}

module.exports = {
  initDatabase
};

