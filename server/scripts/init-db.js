/**
 * Script d'initialisation de la base de données
 * - Vérifie la connexion à la BDD
 * - Exécute les migrations si nécessaire
 * - Crée les utilisateurs initiaux
 * 
 * Usage: node scripts/init-db.js
 */

require('dotenv').config();
const { execSync } = require('child_process');
const db = require('../models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...\n');
    console.log('='.repeat(60));
    
    // Détecter l'environnement et la base de données utilisée
    const env = process.env.NODE_ENV || 'development';
    const dbDialect = db.sequelize.getDialect();
    const dbName = db.sequelize.config.database || db.sequelize.config.storage || 'in-memory';
    
    console.log(`📊 Environnement: ${env}`);
    console.log(`📊 Base de données: ${dbDialect.toUpperCase()}`);
    if (dbDialect === 'mysql') {
      console.log(`📊 Host: ${db.sequelize.config.host}:${db.sequelize.config.port}`);
      console.log(`📊 Database: ${dbName}`);
    } else {
      console.log(`📊 Fichier: ${dbName}`);
    }
    console.log('');
    
    // 1. Vérifier la connexion à la base de données
    console.log('🔌 Étape 1: Connexion à la base de données...');
    try {
      await db.sequelize.authenticate();
      console.log(`   ✅ Connexion réussie (${dbDialect.toUpperCase()})\n`);
    } catch (error) {
      console.error('   ❌ Erreur de connexion:', error.message);
      if (dbDialect === 'mysql') {
        console.error('   💡 Vérifiez que les variables DB_HOST, DB_NAME, DB_USER, DB_PASSWORD sont correctes');
      }
      throw error;
    }
    
    // 2. Exécuter les migrations
    console.log('🔄 Étape 2: Exécution des migrations...');
    try {
      // Utiliser NODE_ENV ou 'development' par défaut
      const migrationEnv = process.env.NODE_ENV || 'development';
      execSync('npx sequelize-cli db:migrate', {
        stdio: 'pipe',
        cwd: __dirname + '/..',
        env: { ...process.env, NODE_ENV: migrationEnv }
      });
      console.log(`   ✅ Migrations exécutées avec succès (env: ${migrationEnv})\n`);
    } catch (migrationError) {
      // Afficher l'erreur pour le débogage
      console.log('   ⚠️  Erreur lors des migrations (peut être normale si déjà exécutées)');
      if (migrationError.stdout) {
        console.log('   Output:', migrationError.stdout.toString());
      }
      if (migrationError.stderr) {
        console.log('   Erreur:', migrationError.stderr.toString());
      }
      console.log('   ℹ️  Continuons quand même...\n');
    }
    
    // 3. Synchroniser les modèles (créer les tables si elles n'existent pas)
    console.log('📊 Étape 3: Synchronisation des modèles...');
    await db.sequelize.sync({ alter: false });
    console.log('   ✅ Modèles synchronisés\n');
    
    // 4. Créer les utilisateurs initiaux
    console.log('👤 Étape 4: Création des utilisateurs initiaux...');
    
    // Utilisateur Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jobsecker.fr';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin2026';
    
    try {
      let admin = await db.User.findOne({ where: { email: adminEmail } });
      if (admin) {
        console.log(`   ℹ️  Utilisateur ADMIN existe déjà: ${adminEmail} (ID: ${admin.id})`);
      } else {
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        admin = await db.User.create({
          id: Date.now(),
          email: adminEmail,
          password: hashedAdminPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`   ✅ Utilisateur ADMIN créé: ${adminEmail} (ID: ${admin.id})`);
      }
    } catch (error) {
      console.error(`   ❌ Erreur lors de la création de l'admin:`, error.message);
      throw error;
    }
    
    // Utilisateur Recruteur
    const recruiterEmail = process.env.RECRUITER_EMAIL || 'recruteur@jobsecker.fr';
    const recruiterPassword = process.env.RECRUITER_PASSWORD || 'recruteur2026';
    
    try {
      let recruiter = await db.User.findOne({ where: { email: recruiterEmail } });
      if (recruiter) {
        console.log(`   ℹ️  Utilisateur RECRUTEUR existe déjà: ${recruiterEmail} (ID: ${recruiter.id})`);
      } else {
        const hashedRecruiterPassword = await bcrypt.hash(recruiterPassword, 10);
        recruiter = await db.User.create({
          id: Date.now() + 1,
          email: recruiterEmail,
          password: hashedRecruiterPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`   ✅ Utilisateur RECRUTEUR créé: ${recruiterEmail} (ID: ${recruiter.id})`);
      }
    } catch (error) {
      console.error(`   ❌ Erreur lors de la création du recruteur:`, error.message);
      throw error;
    }
    
    console.log('');
    
    // 5. Afficher un résumé
    console.log('📋 Résumé de l\'initialisation:');
    console.log('='.repeat(60));
    
    // Compter les utilisateurs
    const userCount = await db.User.count();
    console.log(`👤 Utilisateurs: ${userCount}`);
    
    // Compter les todos
    const todoCount = await db.Todo.count();
    console.log(`📝 Todos: ${todoCount}`);
    
    // Compter les tags
    const tagCount = await db.Tag.count();
    console.log(`🏷️  Tags: ${tagCount}`);
    
    // Compter les jobs
    const jobCount = await db.Job.count();
    console.log(`💼 Jobs: ${jobCount}`);
    
    // Compter les commentaires
    const commentCount = await db.Comment.count();
    console.log(`💬 Commentaires: ${commentCount}`);
    
    console.log('');
    console.log('🔐 Identifiants des utilisateurs:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 RECRUTEUR');
    console.log(`   Email: ${recruiterEmail}`);
    console.log(`   Mot de passe: ${recruiterPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Initialisation terminée avec succès!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  initDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
