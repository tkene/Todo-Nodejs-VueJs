/**
 * Script pour télécharger la base de données depuis Zeabur
 * À exécuter EN LOCAL pour télécharger le backup depuis Zeabur
 * 
 * Prérequis:
 * 1. Installer la CLI Zeabur: npm install -g @zeabur/cli
 * 2. Se connecter: zeabur login
 * 3. Avoir le service ID de votre backend sur Zeabur
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function downloadDatabase() {
  try {
    console.log('📥 Téléchargement de la base de données depuis Zeabur...\n');
    
    // Vérifier que zeabur CLI est installé
    try {
      execSync('zeabur --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Zeabur CLI n\'est pas installé!');
      console.log('\n💡 Installation:');
      console.log('   npm install -g @zeabur/cli');
      console.log('   zeabur login');
      process.exit(1);
    }
    
    // Demander le service ID (ou le récupérer depuis l'env)
    const serviceId = process.env.ZEABUR_SERVICE_ID;
    if (!serviceId) {
      console.log('⚠️  Variable ZEABUR_SERVICE_ID non définie');
      console.log('💡 Options:');
      console.log('   1. Définir ZEABUR_SERVICE_ID dans votre .env');
      console.log('   2. Ou passer le service ID en argument: node scripts/download-database.js <service-id>');
      console.log('\n📋 Pour trouver votre service ID:');
      console.log('   - Allez sur votre projet Zeabur');
      console.log('   - Ouvrez votre service backend');
      console.log('   - Le service ID est dans l\'URL ou les settings');
      
      const args = process.argv.slice(2);
      if (args.length === 0) {
        console.log('\n❌ Service ID requis');
        process.exit(1);
      }
      serviceId = args[0];
    }
    
    console.log(`🔗 Service ID: ${serviceId}\n`);
    
    // Étape 1: Créer le backup sur Zeabur
    console.log('📋 Étape 1: Création du backup sur Zeabur...');
    try {
      execSync(`zeabur exec ${serviceId} -- "cd server && node scripts/backup-database.js"`, {
        stdio: 'inherit'
      });
      console.log('✅ Backup créé sur Zeabur\n');
    } catch (error) {
      console.error('❌ Erreur lors de la création du backup:', error.message);
      process.exit(1);
    }
    
    // Étape 2: Télécharger le fichier
    console.log('📥 Étape 2: Téléchargement du fichier...');
    const localBackupPath = path.join(__dirname, '../../database-backup-zeabur.sqlite');
    
    try {
      // Utiliser zeabur download pour télécharger le fichier
      execSync(`zeabur download ${serviceId} server/database-backup.sqlite ${localBackupPath}`, {
        stdio: 'inherit'
      });
      
      if (fs.existsSync(localBackupPath)) {
        const stats = fs.statSync(localBackupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log('\n✅ Téléchargement réussi!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📁 Fichier: ${localBackupPath}`);
        console.log(`📊 Taille: ${fileSizeInMB} MB`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Proposer de remplacer la base de données locale
        console.log('\n💡 Pour utiliser cette base de données en local:');
        console.log(`   cp ${localBackupPath} database.sqlite`);
        console.log('   (Attention: cela remplacera votre base de données locale)');
      } else {
        console.error('❌ Le fichier n\'a pas été téléchargé');
      }
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error.message);
      console.log('\n💡 Alternative: Utilisez le terminal Zeabur pour télécharger manuellement');
      console.log('   1. Allez sur Zeabur → Votre service → Terminal');
      console.log('   2. Exécutez: cd server && node scripts/backup-database.js');
      console.log('   3. Téléchargez le fichier database-backup.sqlite via l\'interface Zeabur');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  downloadDatabase();
}

module.exports = { downloadDatabase };

