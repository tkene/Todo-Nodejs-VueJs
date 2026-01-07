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
    
    // 1. Vérifier la connexion à la base de données
    console.log('🔌 Étape 1: Connexion à la base de données...');
    try {
      await db.sequelize.authenticate();
      console.log('   ✅ Connexion réussie\n');
    } catch (error) {
      console.error('   ❌ Erreur de connexion:', error.message);
      throw error;
    }
    
    // 2. Exécuter les migrations
    console.log('🔄 Étape 2: Exécution des migrations...');
    try {
      execSync('npx sequelize-cli db:migrate', {
        stdio: 'pipe',
        cwd: __dirname + '/..',
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
      });
      console.log('   ✅ Migrations exécutées avec succès\n');
    } catch (migrationError) {
      // Les migrations peuvent déjà être à jour
      console.log('   ℹ️  Migrations déjà à jour ou erreur (non bloquante)\n');
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
    
    let admin = await db.User.findOne({ where: { email: adminEmail } });
    if (admin) {
      console.log(`   ℹ️  Utilisateur ADMIN existe déjà: ${adminEmail}`);
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      admin = await db.User.create({
        id: Date.now(),
        email: adminEmail,
        password: hashedAdminPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ Utilisateur ADMIN créé: ${adminEmail}`);
    }
    
    // Utilisateur Recruteur
    const recruiterEmail = process.env.RECRUITER_EMAIL || 'recruteur@jobsecker.fr';
    const recruiterPassword = process.env.RECRUITER_PASSWORD || 'recruteur2026';
    
    let recruiter = await db.User.findOne({ where: { email: recruiterEmail } });
    if (recruiter) {
      console.log(`   ℹ️  Utilisateur RECRUTEUR existe déjà: ${recruiterEmail}`);
    } else {
      const hashedRecruiterPassword = await bcrypt.hash(recruiterPassword, 10);
      recruiter = await db.User.create({
        id: Date.now() + 1,
        email: recruiterEmail,
        password: hashedRecruiterPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ Utilisateur RECRUTEUR créé: ${recruiterEmail}`);
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

