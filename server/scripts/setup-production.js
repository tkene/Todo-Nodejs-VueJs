/**
 * Script de configuration complète pour la production
 * Exécute toutes les migrations de données nécessaires
 */

require('dotenv').config();
const db = require('../models');
const userModule = require('../modules/users');
const { readDB } = require('../modules/db');

async function setupProduction() {
  try {
    console.log('🚀 Configuration de la production...\n');
    
    // 1. Synchroniser la base de données
    await db.sequelize.sync({ alter: false });
    console.log('✅ Base de données synchronisée\n');
    
    // 2. Créer les utilisateurs initiaux
    console.log('👤 Création des utilisateurs initiaux...');
    const adminEmail = 'jobsecker@jobsecker.com';
    const recruiterEmail = 'recruteur@jobsecker.com';
    
    let admin = await userModule.findUserByEmail(adminEmail);
    if (!admin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('jobsecker2025', 10);
      admin = await db.User.create({
        id: Date.now(),
        email: adminEmail,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Utilisateur admin créé: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Utilisateur admin existe déjà: ${adminEmail}`);
    }
    
    let recruiter = await userModule.findUserByEmail(recruiterEmail);
    if (!recruiter) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('recruteur2025', 10);
      recruiter = await db.User.create({
        id: Date.now() + 1,
        email: recruiterEmail,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Utilisateur recruteur créé: ${recruiterEmail}`);
    } else {
      console.log(`ℹ️  Utilisateur recruteur existe déjà: ${recruiterEmail}`);
    }
    
    console.log('');
    
    // 3. Rattacher les données existantes à l'utilisateur admin (si données existantes)
    console.log('📦 Attribution des données à l\'utilisateur admin...');
    const todosWithoutUser = await db.Todo.findAll({ where: { userId: null } });
    const jobsWithoutUser = await db.Job.findAll({ where: { userId: null } });
    const tagsWithoutUser = await db.Tag.findAll({ where: { userId: null } });
    
    if (todosWithoutUser.length > 0 || jobsWithoutUser.length > 0 || tagsWithoutUser.length > 0) {
      await db.Todo.update({ userId: admin.id }, { where: { userId: null } });
      await db.Job.update({ userId: admin.id }, { where: { userId: null } });
      await db.Tag.update({ userId: admin.id }, { where: { userId: null } });
      console.log(`✅ ${todosWithoutUser.length} todos rattachés`);
      console.log(`✅ ${jobsWithoutUser.length} jobs rattachés`);
      console.log(`✅ ${tagsWithoutUser.length} tags rattachés`);
    } else {
      console.log('ℹ️  Toutes les données ont déjà un userId');
    }
    
    console.log('');
    
    // 4. Migrer les commentaires depuis db.json (si le fichier existe)
    try {
      const jsonData = readDB();
      if (jsonData.comments && jsonData.comments.length > 0) {
        console.log(`📝 Migration de ${jsonData.comments.length} commentaires depuis db.json...`);
        
        const userJobs = await db.Job.findAll({
          where: { userId: admin.id },
          attributes: ['id']
        });
        const userJobIds = new Set(userJobs.map(job => job.id));
        
        let migratedCount = 0;
        for (const comment of jsonData.comments) {
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
              // Ignorer les erreurs de contrainte unique
            }
          }
        }
        console.log(`✅ ${migratedCount} commentaires migrés`);
      } else {
        console.log('ℹ️  Aucun commentaire trouvé dans db.json');
      }
    } catch (error) {
      console.log('ℹ️  db.json non trouvé ou inaccessible (normal en production)');
    }
    
    console.log('');
    
    // 5. Résumé final
    const totalTodos = await db.Todo.count({ where: { userId: admin.id } });
    const totalJobs = await db.Job.count({ where: { userId: admin.id } });
    const totalTags = await db.Tag.count({ where: { userId: admin.id } });
    const totalComments = await db.Comment.count({
      include: [{
        model: db.Job,
        as: 'job',
        where: { userId: admin.id }
      }]
    });
    
    console.log('📊 Résumé final:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Utilisateur admin: ${adminEmail}`);
    console.log(`   Todos: ${totalTodos}`);
    console.log(`   Jobs: ${totalJobs}`);
    console.log(`   Tags: ${totalTags}`);
    console.log(`   Commentaires: ${totalComments}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Configuration de la production terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  setupProduction()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { setupProduction };

