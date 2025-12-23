/**
 * Script pour vérifier les commentaires dans la base de données
 */

require('dotenv').config();
const db = require('../models');

async function checkComments() {
  try {
    console.log('🔍 Vérification des commentaires dans la base de données...\n');
    
    // Synchroniser la base de données
    await db.sequelize.sync({ alter: false });
    
    // Récupérer tous les commentaires
    const allComments = await db.Comment.findAll({
      include: [{
        model: db.Job,
        as: 'job',
        attributes: ['id', 'company', 'job', 'userId']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Total de commentaires: ${allComments.length}\n`);
    
    if (allComments.length === 0) {
      console.log('ℹ️  Aucun commentaire trouvé dans la base de données.');
      console.log('💡 Les commentaires doivent être créés via l\'interface utilisateur.');
    } else {
      console.log('📝 Liste des commentaires:\n');
      allComments.forEach((comment, index) => {
        console.log(`${index + 1}. Commentaire ID: ${comment.id}`);
        console.log(`   Job ID: ${comment.jobId}`);
        if (comment.job) {
          console.log(`   Job: ${comment.job.company || 'N/A'} - ${comment.job.job || 'N/A'}`);
          console.log(`   UserId du job: ${comment.job.userId || 'NULL'}`);
        }
        console.log(`   Commentaire: ${comment.comment.substring(0, 50)}${comment.comment.length > 50 ? '...' : ''}`);
        console.log(`   Créé le: ${comment.createdAt}`);
        console.log('');
      });
    }
    
    // Vérifier les jobs avec leurs commentaires
    const jobsWithComments = await db.Job.findAll({
      include: [{
        model: db.Comment,
        as: 'comments'
      }],
      where: {}
    });
    
    console.log('\n📋 Jobs avec commentaires:');
    jobsWithComments.forEach(job => {
      if (job.comments && job.comments.length > 0) {
        console.log(`\n   Job ID: ${job.id} (${job.company || 'N/A'} - ${job.job || 'N/A'})`);
        console.log(`   UserId: ${job.userId || 'NULL'}`);
        console.log(`   Nombre de commentaires: ${job.comments.length}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  checkComments()
    .then(() => {
      console.log('\n✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { checkComments };

