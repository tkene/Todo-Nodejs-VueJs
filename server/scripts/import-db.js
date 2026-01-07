/**
 * Script d'import des données depuis database-export.json
 * Importe toutes les données dans l'ordre correct pour respecter les clés étrangères
 * 
 * Usage: node scripts/import-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../models');

async function importDatabase() {
  try {
    console.log('📥 Import de la base de données...\n');
    console.log('='.repeat(60));
    
    // 1. Vérifier que le fichier d'export existe
    const exportPath = path.join(__dirname, '../database-export.json');
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Fichier d'export non trouvé: ${exportPath}\nExécutez d'abord: node scripts/export-db.js`);
    }
    
    // 2. Charger les données
    console.log('📂 Chargement du fichier d'export...');
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`   ✅ Fichier chargé (exporté le: ${exportData.metadata.exportDate})\n`);
    
    // 3. Vérifier la connexion
    console.log('🔌 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('   ✅ Connexion réussie\n');
    
    // 4. Synchroniser les modèles (créer les tables si nécessaire)
    console.log('📊 Synchronisation des modèles...');
    await db.sequelize.sync({ alter: false });
    console.log('   ✅ Modèles synchronisés\n');
    
    // 5. Importer dans l'ordre des dépendances
    const { data } = exportData;
    
    // Users (pas de dépendances)
    console.log('👤 Import des utilisateurs...');
    let importedUsers = 0;
    let skippedUsers = 0;
    for (const user of data.users) {
      const existing = await db.User.findByPk(user.id);
      if (existing) {
        skippedUsers++;
        continue;
      }
      await db.User.create(user);
      importedUsers++;
    }
    console.log(`   ✅ ${importedUsers} utilisateur(s) importé(s), ${skippedUsers} déjà existant(s)`);
    
    // Tags (dépend de Users)
    console.log('🏷️  Import des tags...');
    let importedTags = 0;
    let skippedTags = 0;
    for (const tag of data.tags) {
      const existing = await db.Tag.findByPk(tag.id);
      if (existing) {
        skippedTags++;
        continue;
      }
      await db.Tag.create(tag);
      importedTags++;
    }
    console.log(`   ✅ ${importedTags} tag(s) importé(s), ${skippedTags} déjà existant(s)`);
    
    // Todos (dépend de Users)
    console.log('📝 Import des todos...');
    let importedTodos = 0;
    let skippedTodos = 0;
    for (const todo of data.todos) {
      const existing = await db.Todo.findByPk(todo.id);
      if (existing) {
        skippedTodos++;
        continue;
      }
      await db.Todo.create(todo);
      importedTodos++;
    }
    console.log(`   ✅ ${importedTodos} todo(s) importé(s), ${skippedTodos} déjà existant(s)`);
    
    // Jobs (dépend de Users)
    console.log('💼 Import des jobs...');
    let importedJobs = 0;
    let skippedJobs = 0;
    for (const job of data.jobs) {
      const existing = await db.Job.findByPk(job.id);
      if (existing) {
        skippedJobs++;
        continue;
      }
      await db.Job.create(job);
      importedJobs++;
    }
    console.log(`   ✅ ${importedJobs} job(s) importé(s), ${skippedJobs} déjà existant(s)`);
    
    // Comments (dépend de Jobs)
    console.log('💬 Import des commentaires...');
    let importedComments = 0;
    let skippedComments = 0;
    for (const comment of data.comments) {
      const existing = await db.Comment.findByPk(comment.id);
      if (existing) {
        skippedComments++;
        continue;
      }
      await db.Comment.create(comment);
      importedComments++;
    }
    console.log(`   ✅ ${importedComments} commentaire(s) importé(s), ${skippedComments} déjà existant(s)`);
    
    // TodoTags (table de liaison, dépend de Todos et Tags)
    console.log('🔗 Import des relations TodoTags...');
    let importedRelations = 0;
    let skippedRelations = 0;
    for (const relation of data.todoTags) {
      // Vérifier si la relation existe déjà
      const [existing] = await db.sequelize.query(
        'SELECT * FROM TodoTags WHERE todoId = ? AND tagId = ?',
        {
          replacements: [relation.todoId, relation.tagId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      if (existing && existing.length > 0) {
        skippedRelations++;
        continue;
      }
      // Insérer la relation
      await db.sequelize.query(
        'INSERT INTO TodoTags (todoId, tagId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
        {
          replacements: [
            relation.todoId,
            relation.tagId,
            relation.createdAt || new Date(),
            relation.updatedAt || new Date()
          ]
        }
      );
      importedRelations++;
    }
    console.log(`   ✅ ${importedRelations} relation(s) importée(s), ${skippedRelations} déjà existante(s)`);
    
    console.log('');
    console.log('✅ Import terminé avec succès!');
    console.log('='.repeat(60));
    console.log('📋 Résumé:');
    console.log(`   👤 Utilisateurs: ${importedUsers} importé(s), ${skippedUsers} ignoré(s)`);
    console.log(`   🏷️  Tags: ${importedTags} importé(s), ${skippedTags} ignoré(s)`);
    console.log(`   📝 Todos: ${importedTodos} importé(s), ${skippedTodos} ignoré(s)`);
    console.log(`   💼 Jobs: ${importedJobs} importé(s), ${skippedJobs} ignoré(s)`);
    console.log(`   💬 Commentaires: ${importedComments} importé(s), ${skippedComments} ignoré(s)`);
    console.log(`   🔗 Relations: ${importedRelations} importée(s), ${skippedRelations} ignorée(s)`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'import:', error.message);
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
  importDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { importDatabase };

