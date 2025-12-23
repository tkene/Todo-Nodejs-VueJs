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
    
    // 3. Migrer les données depuis db.json (si le fichier existe)
    console.log('📦 Migration des données depuis db.json...');
    try {
      const jsonData = readDB();
      
      // Migrer les tags
      if (jsonData.tags && jsonData.tags.length > 0) {
        console.log(`📦 Migration de ${jsonData.tags.length} tags...`);
        for (const tag of jsonData.tags) {
          await db.Tag.upsert({
            id: tag.id,
            name: tag.name,
            userId: admin.id // Attribuer directement à l'admin
          });
        }
        console.log(`✅ ${jsonData.tags.length} tags migrés`);
      }
      
      // Migrer les todos
      if (jsonData.todos && jsonData.todos.length > 0) {
        console.log(`📦 Migration de ${jsonData.todos.length} todos...`);
        for (const todo of jsonData.todos) {
          await db.Todo.upsert({
            id: todo.id,
            text: todo.text,
            done: todo.done || false,
            createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
            userId: admin.id // Attribuer directement à l'admin
          });
          
          // Migrer les relations tags
          if (todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0) {
            const tagIds = todo.tags.filter(id => typeof id === 'number');
            if (tagIds.length > 0) {
              const todoInstance = await db.Todo.findByPk(todo.id);
              if (todoInstance) {
                await todoInstance.setTags(tagIds);
              }
            }
          }
        }
        console.log(`✅ ${jsonData.todos.length} todos migrés`);
      }
      
      // Migrer les jobs
      if (jsonData.jobs && jsonData.jobs.length > 0) {
        console.log(`📦 Migration de ${jsonData.jobs.length} jobs...`);
        for (const job of jsonData.jobs) {
          await db.Job.upsert({
            id: job.id,
            company: job.company,
            job: job.job,
            status: job.status,
            date: job.date ? new Date(job.date) : null,
            job_link: job.job_link,
            contactName: job.contactName,
            contactEmail: job.contactEmail,
            contactPhone: job.contactPhone,
            platform: job.platform,
            language: Array.isArray(job.language) ? JSON.stringify(job.language) : job.language,
            createdAt: job.createdAt ? new Date(job.createdAt) : null,
            userId: admin.id // Attribuer directement à l'admin
          });
        }
        console.log(`✅ ${jsonData.jobs.length} jobs migrés`);
      }
      
      console.log('');
    } catch (error) {
      console.log('ℹ️  db.json non trouvé ou inaccessible (normal si pas de données à migrer)');
      console.log('');
      
      // Si db.json n'existe pas, rattacher les données existantes sans userId
      console.log('📦 Attribution des données existantes à l\'utilisateur admin...');
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
    }
    
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

