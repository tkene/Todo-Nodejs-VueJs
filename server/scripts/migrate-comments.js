/**
 * Script pour migrer les commentaires depuis db.json vers la base de données
 * Uniquement pour les jobs qui appartiennent à jobsecker@jobsecker.com
 */

require('dotenv').config();
const { readDB } = require('../modules/db');
const db = require('../models');
const userModule = require('../modules/users');

async function migrateComments() {
  try {
    console.log('🔄 Migration des commentaires depuis db.json...\n');
    
    // Synchroniser la base de données
    await db.sequelize.sync({ alter: false });
    
    // Trouver l'utilisateur jobsecker@jobsecker.com
    const user = await userModule.findUserByEmail('jobsecker@jobsecker.com');
    
    if (!user) {
      console.error('❌ Utilisateur jobsecker@jobsecker.com non trouvé!');
      process.exit(1);
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})\n`);
    
    // Lire les données depuis db.json
    const jsonData = readDB();
    
    if (!jsonData.comments || jsonData.comments.length === 0) {
      console.log('ℹ️  Aucun commentaire trouvé dans db.json');
      process.exit(0);
    }
    
    console.log(`📦 ${jsonData.comments.length} commentaires trouvés dans db.json\n`);
    
    // Récupérer tous les jobs de l'utilisateur
    const userJobs = await db.Job.findAll({
      where: { userId: user.id },
      attributes: ['id']
    });
    
    const userJobIds = new Set(userJobs.map(job => job.id));
    console.log(`📋 ${userJobIds.size} jobs trouvés pour l'utilisateur\n`);
    
    // Migrer les commentaires qui sont liés aux jobs de l'utilisateur
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const comment of jsonData.comments) {
      // Vérifier si le job du commentaire appartient à l'utilisateur
      if (userJobIds.has(comment.jobId)) {
        try {
          await db.Comment.upsert({
            id: comment.id,
            jobId: comment.jobId,
            comment: comment.comment,
            createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
          });
          migratedCount++;
        } catch (error) {
          // Ignorer les erreurs de contrainte unique (commentaire déjà existant)
          if (error.name !== 'SequelizeUniqueConstraintError') {
            console.error(`❌ Erreur lors de la migration du commentaire ${comment.id}:`, error.message);
          } else {
            skippedCount++;
          }
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ ${migratedCount} commentaires migrés`);
    if (skippedCount > 0) {
      console.log(`ℹ️  ${skippedCount} commentaires ignorés (déjà existants ou jobs non trouvés)`);
    }
    
    // Vérifier le résultat
    const totalComments = await db.Comment.count({
      include: [{
        model: db.Job,
        as: 'job',
        where: { userId: user.id }
      }]
    });
    
    console.log(`\n📊 Total de commentaires pour l'utilisateur: ${totalComments}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  migrateComments()
    .then(() => {
      console.log('\n✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { migrateComments };

