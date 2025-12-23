/**
 * Script pour restaurer une base de données depuis un backup
 * Remplace la base de données locale par le backup téléchargé
 */

const fs = require('fs');
const path = require('path');

function restoreDatabase(backupPath) {
  try {
    console.log('🔄 Restauration de la base de données...\n');
    
    // Chemin de la base de données locale
    const dbPath = path.join(__dirname, '../../database.sqlite');
    const backupFullPath = path.resolve(backupPath);
    
    // Vérifier que le backup existe
    if (!fs.existsSync(backupFullPath)) {
      console.error(`❌ Fichier backup non trouvé: ${backupFullPath}`);
      process.exit(1);
    }
    
    // Créer un backup de la base de données actuelle (si elle existe)
    if (fs.existsSync(dbPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackupPath = path.join(__dirname, `../../database-local-backup-${timestamp}.sqlite`);
      console.log('💾 Sauvegarde de la base de données locale actuelle...');
      fs.copyFileSync(dbPath, currentBackupPath);
      console.log(`✅ Backup local créé: database-local-backup-${timestamp}.sqlite\n`);
    }
    
    // Copier le backup vers la base de données
    console.log(`📋 Restauration depuis: ${backupFullPath}`);
    fs.copyFileSync(backupFullPath, dbPath);
    
    // Vérifier la taille
    const stats = fs.statSync(dbPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Base de données restaurée avec succès!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 Fichier restauré: ${dbPath}`);
    console.log(`📊 Taille: ${fileSizeInMB} MB`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Redémarrez votre serveur pour utiliser la nouvelle base de données');
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/restore-database.js <chemin-vers-backup>');
    console.log('Exemple: node scripts/restore-database.js database-backup-zeabur.sqlite');
    process.exit(1);
  }
  
  restoreDatabase(args[0]);
}

module.exports = { restoreDatabase };

