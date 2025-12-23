require('dotenv').config();
const { readDB } = require('../modules/db');
const db = require('../models');

async function migrateData() {
  try {
    console.log('🔄 Démarrage de la migration des données depuis db.json...');
    
    // Lire les données depuis db.json
    const jsonData = readDB();
    
    // Synchroniser la base de données (créer les tables si elles n'existent pas)
    await db.sequelize.sync({ force: false });
    console.log('✅ Tables synchronisées');
    
    // Migrer les tags
    if (jsonData.tags && jsonData.tags.length > 0) {
      console.log(`📦 Migration de ${jsonData.tags.length} tags...`);
      for (const tag of jsonData.tags) {
        await db.Tag.upsert({
          id: tag.id,
          name: tag.name
        });
      }
      console.log('✅ Tags migrés');
    }
    
    // Migrer les todos
    if (jsonData.todos && jsonData.todos.length > 0) {
      console.log(`📦 Migration de ${jsonData.todos.length} todos...`);
      for (const todo of jsonData.todos) {
        const todoRecord = await db.Todo.upsert({
          id: todo.id,
          text: todo.text,
          done: todo.done || false,
          createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date()
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
      console.log('✅ Todos migrés');
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
          createdAt: job.createdAt ? new Date(job.createdAt) : null
        });
      }
      console.log('✅ Jobs migrés');
    }
    
    // Migrer les comments
    if (jsonData.comments && jsonData.comments.length > 0) {
      console.log(`📦 Migration de ${jsonData.comments.length} commentaires...`);
      for (const comment of jsonData.comments) {
        await db.Comment.upsert({
          id: comment.id,
          jobId: comment.jobId,
          comment: comment.comment,
          createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
        });
      }
      console.log('✅ Commentaires migrés');
    }
    
    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateData();

