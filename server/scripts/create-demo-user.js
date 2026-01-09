/**
 * Script de création d'un utilisateur de démonstration
 * avec des exemples de todos, tags et job alerts
 * pour une présentation lors d'un recrutement
 * 
 * Usage: node server/scripts/create-demo-user.js
 */

require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  try {
    console.log('🚀 Création d\'un utilisateur de démonstration...\n');
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
    
    // 2. Créer l'utilisateur de démonstration
    console.log('👤 Étape 2: Création de l\'utilisateur...');
    const demoEmail = 'demo@developpeur.fr';
    const demoPassword = 'demo2026';
    
    let user = await db.User.findOne({ where: { email: demoEmail } });
    if (user) {
      console.log(`   ℹ️  Utilisateur existe déjà: ${demoEmail} (ID: ${user.id})`);
      console.log('   🗑️  Suppression des données existantes...');
      
      // Récupérer tous les todos de l'utilisateur
      const existingTodos = await db.Todo.findAll({ where: { userId: user.id } });
      const todoIds = existingTodos.map(t => t.id);
      
      // Supprimer d'abord les associations TodoTags
      if (todoIds.length > 0) {
        await db.sequelize.query(
          'DELETE FROM TodoTags WHERE todoId IN (' + todoIds.map(() => '?').join(',') + ')',
          {
            replacements: todoIds,
            type: db.sequelize.QueryTypes.DELETE
          }
        );
      }
      
      // Supprimer les données existantes
      await db.Todo.destroy({ where: { userId: user.id } });
      await db.Job.destroy({ where: { userId: user.id } });
      await db.Tag.destroy({ where: { userId: user.id } });
      console.log('   ✅ Données existantes supprimées');
    } else {
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      user = await db.User.create({
        id: Date.now(),
        email: demoEmail,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ Utilisateur créé: ${demoEmail} (ID: ${user.id})`);
    }
    console.log('');
    
    // 3. Créer les tags
    console.log('🏷️  Étape 3: Création des tags...');
    const tagsData = [
      { name: 'Urgent', id: Date.now() + 1000 },
      { name: 'Important', id: Date.now() + 2000 },
      { name: 'Backend', id: Date.now() + 3000 },
      { name: 'Frontend', id: Date.now() + 4000 },
      { name: 'Fullstack', id: Date.now() + 5000 },
      { name: 'React', id: Date.now() + 6000 },
      { name: 'Vue.js', id: Date.now() + 7000 },
      { name: 'Node.js', id: Date.now() + 8000 },
      { name: 'Entretien', id: Date.now() + 9000 },
      { name: 'Recherche', id: Date.now() + 10000 }
    ];
    
    const tags = [];
    const tagMap = {}; // Mapping nom original -> tag créé
    
    for (const tagData of tagsData) {
      // Chercher d'abord un tag existant avec ce nom pour cet utilisateur
      let tag = await db.Tag.findOne({ 
        where: { name: tagData.name, userId: user.id } 
      });
      
      if (!tag) {
        // Si le tag n'existe pas pour cet utilisateur, vérifier s'il existe globalement
        const existingTag = await db.Tag.findOne({ 
          where: { name: tagData.name } 
        });
        
        if (existingTag) {
          // Si le tag existe déjà globalement, créer un nouveau tag avec un nom unique
          const uniqueName = `${tagData.name}_${user.id}`;
          tag = await db.Tag.create({
            id: tagData.id,
            name: uniqueName,
            userId: user.id
          });
          console.log(`   ✅ Tag créé avec nom unique: ${uniqueName} (original: ${tagData.name})`);
        } else {
          // Si le tag n'existe pas du tout, le créer normalement
          tag = await db.Tag.create({
            id: tagData.id,
            name: tagData.name,
            userId: user.id
          });
          console.log(`   ✅ Tag créé: ${tagData.name}`);
        }
      } else {
        console.log(`   ℹ️  Tag existe déjà: ${tagData.name}`);
      }
      tags.push(tag);
      tagMap[tagData.name] = tag; // Stocker le mapping nom original -> tag
    }
    console.log('');
    
    // 4. Créer les todos
    console.log('📝 Étape 4: Création des todos...');
    const todosData = [
      {
        id: Date.now() + 20000,
        text: 'Préparer le portfolio avec les projets récents',
        done: true,
        tagNames: ['Important', 'Frontend']
      },
      {
        id: Date.now() + 21000,
        text: 'Mettre à jour le CV avec les dernières expériences',
        done: true,
        tagNames: ['Urgent', 'Important']
      },
      {
        id: Date.now() + 22000,
        text: 'Créer un projet de démonstration avec Vue.js et Node.js',
        done: false,
        tagNames: ['Fullstack', 'Vue.js', 'Node.js']
      },
      {
        id: Date.now() + 23000,
        text: 'Réviser les concepts React et hooks avancés',
        done: false,
        tagNames: ['Frontend', 'React']
      },
      {
        id: Date.now() + 24000,
        text: 'Préparer les questions pour l\'entretien technique',
        done: false,
        tagNames: ['Entretien', 'Important']
      },
      {
        id: Date.now() + 25000,
        text: 'Optimiser les performances de l\'API backend',
        done: false,
        tagNames: ['Backend', 'Node.js', 'Urgent']
      },
      {
        id: Date.now() + 26000,
        text: 'Rechercher des offres d\'emploi Fullstack',
        done: true,
        tagNames: ['Recherche']
      },
      {
        id: Date.now() + 27000,
        text: 'Créer des tests unitaires pour le projet',
        done: false,
        tagNames: ['Backend', 'Important']
      }
    ];
    
    const todos = [];
    for (const todoData of todosData) {
      const todo = await db.Todo.create({
        id: todoData.id,
        text: todoData.text,
        done: todoData.done,
        userId: user.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Dates aléatoires dans les 30 derniers jours
      });
      
      // Associer les tags en utilisant le mapping
      const todoTags = todoData.tagNames
        .map(tagName => tagMap[tagName])
        .filter(tag => tag !== undefined);
      
      // Insérer directement dans la table TodoTags en vérifiant d'abord l'existence
      if (todoTags.length > 0) {
        const now = new Date();
        for (const tag of todoTags) {
          // Insérer l'association en gérant les erreurs de contrainte unique
          try {
            await db.sequelize.query(
              'INSERT INTO TodoTags (todoId, tagId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
              {
                replacements: [todo.id, tag.id, now, now],
                type: db.sequelize.QueryTypes.INSERT
              }
            );
          } catch (err) {
            // Ignorer les erreurs de contrainte unique (l'association existe déjà)
            if (err.name !== 'SequelizeUniqueConstraintError' && !err.message.includes('UNIQUE constraint')) {
              throw err;
            }
          }
        }
      }
      
      todos.push(todo);
      console.log(`   ✅ Todo créé: ${todoData.text.substring(0, 50)}...`);
    }
    console.log('');
    
    // 5. Créer les job alerts
    console.log('💼 Étape 5: Création des job alerts...');
    const jobsData = [
      {
        id: Date.now() + 30000,
        company: 'TechCorp',
        job: 'Développeur Fullstack Vue.js / Node.js',
        status: 'Entretien',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.linkedin.com/jobs/view/123456',
        contactName: 'Marie Dupont',
        contactEmail: 'marie.dupont@techcorp.fr',
        contactPhone: '+33 1 23 45 67 89',
        platform: 'LinkedIn',
        language: ['Vue.js', 'Node.js', 'JavaScript', 'PostgreSQL'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 31000,
        company: 'StartupInnovante',
        job: 'Développeur Frontend React',
        status: 'Offre',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.welcometothejungle.com/fr/companies/startup-innovante/jobs',
        contactName: 'Jean Martin',
        contactEmail: 'jean.martin@startup.fr',
        contactPhone: '+33 6 12 34 56 78',
        platform: 'Welcome to the Jungle',
        language: ['React', 'TypeScript', 'JavaScript', 'CSS'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 32000,
        company: 'BigTech',
        job: 'Développeur Backend Node.js',
        status: 'Envoyée',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.bigtech.com/careers/backend-dev',
        contactName: 'Sophie Bernard',
        contactEmail: 'sophie.bernard@bigtech.com',
        contactPhone: null,
        platform: 'Site web',
        language: ['Node.js', 'Express', 'MongoDB', 'Docker'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 33000,
        company: 'AgencyWeb',
        job: 'Développeur Fullstack JavaScript',
        status: 'Relance faite',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.agencyweb.fr/emploi',
        contactName: 'Pierre Leroy',
        contactEmail: 'pierre.leroy@agencyweb.fr',
        contactPhone: '+33 1 98 76 54 32',
        platform: 'Indeed',
        language: ['JavaScript', 'Vue.js', 'Node.js', 'MySQL'],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 34000,
        company: 'E-commercePro',
        job: 'Développeur Frontend Vue.js',
        status: 'À envoyer',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.ecommercepro.fr/careers',
        contactName: null,
        contactEmail: 'jobs@ecommercepro.fr',
        contactPhone: null,
        platform: 'Site web',
        language: ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 35000,
        company: 'DevStudio',
        job: 'Développeur Fullstack React / Node.js',
        status: 'En attente',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        job_link: 'https://www.devstudio.com/jobs',
        contactName: 'Lucie Moreau',
        contactEmail: 'lucie.moreau@devstudio.com',
        contactPhone: '+33 6 98 76 54 32',
        platform: 'LinkedIn',
        language: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: Date.now() + 36000,
        company: 'OldCompany',
        job: 'Développeur PHP Symfony',
        status: 'Refusée',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        job_link: null,
        contactName: 'Thomas Petit',
        contactEmail: 'thomas.petit@oldcompany.fr',
        contactPhone: null,
        platform: 'APEC',
        language: ['PHP', 'Symfony', 'MySQL'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const jobs = [];
    for (const jobData of jobsData) {
      const job = await db.Job.create({
        id: jobData.id,
        company: jobData.company,
        job: jobData.job,
        status: jobData.status,
        date: jobData.date,
        job_link: jobData.job_link,
        contactName: jobData.contactName,
        contactEmail: jobData.contactEmail,
        contactPhone: jobData.contactPhone,
        platform: jobData.platform,
        language: jobData.language,
        userId: user.id,
        createdAt: jobData.createdAt
      });
      
      jobs.push(job);
      console.log(`   ✅ Job créé: ${jobData.company} - ${jobData.job} (${jobData.status})`);
    }
    console.log('');
    
    // 6. Afficher un résumé
    console.log('📋 Résumé de la création:');
    console.log('='.repeat(60));
    console.log(`👤 Utilisateur: ${demoEmail}`);
    console.log(`🔐 Mot de passe: ${demoPassword}`);
    console.log(`📝 Todos créés: ${todos.length}`);
    console.log(`🏷️  Tags créés: ${tags.length}`);
    console.log(`💼 Jobs créés: ${jobs.length}`);
    console.log('');
    console.log('📊 Détails des jobs:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    jobs.forEach(job => {
      console.log(`   • ${job.company} - ${job.job}`);
      console.log(`     Statut: ${job.status} | Date: ${job.date.toLocaleDateString('fr-FR')}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Utilisateur de démonstration créé avec succès!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message);
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
  createDemoUser()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { createDemoUser };

