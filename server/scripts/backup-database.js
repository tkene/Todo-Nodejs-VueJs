/**
 * Script pour créer un backup de la base de données SQLite
 * À exécuter sur Zeabur pour sauvegarder la base de données
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../models');

async function backupDatabase() {
  try {
    console.log('💾 Création d\'un backup de la base de données...\n');
    
    // Chemin de la base de données
    const dbPath = path.join(__dirname, '../../database.sqlite');
    const backupPath = path.join(__dirname, '../../database-backup.sqlite');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampedBackupPath = path.join(__dirname, `../../database-backup-${timestamp}.sqlite`);
    
    // Vérifier que la base de données existe
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Base de données non trouvée:', dbPath);
      process.exit(1);
    }
    
    // Créer une copie de la base de données
    console.log('📋 Copie de la base de données...');
    fs.copyFileSync(dbPath, backupPath);
    fs.copyFileSync(dbPath, timestampedBackupPath);
    
    // Obtenir la taille du fichier
    const stats = fs.statSync(dbPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Backup créé avec succès!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 Fichier principal: database-backup.sqlite`);
    console.log(`📁 Fichier avec timestamp: database-backup-${timestamp}.sqlite`);
    console.log(`📊 Taille: ${fileSizeInMB} MB`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Pour télécharger le fichier depuis Zeabur:');
    console.log('   1. Utilisez la CLI Zeabur: zeabur download <service-id> database-backup.sqlite');
    console.log('   2. Ou utilisez le terminal Zeabur pour copier le fichier');
    console.log('   3. Ou utilisez le script download-database.js en local');
    
    // Afficher les statistiques de la base de données
    await db.sequelize.authenticate();
    const userCount = await db.User.count();
    const todoCount = await db.Todo.count();
    const jobCount = await db.Job.count();
    const tagCount = await db.Tag.count();
    const commentCount = await db.Comment.count();
    
    console.log('\n📊 Statistiques de la base de données:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Utilisateurs: ${userCount}`);
    console.log(`   Todos: ${todoCount}`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Tags: ${tagCount}`);
    console.log(`   Commentaires: ${commentCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du backup:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };

