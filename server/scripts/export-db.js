/**
 * Script d'export de toutes les données de la base de données locale
 * Exporte toutes les tables dans un fichier JSON pour import en production
 * 
 * Usage: node scripts/export-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../models');

async function exportDatabase() {
  try {
    console.log('📤 Export de la base de données locale...\n');
    console.log('='.repeat(60));
    
    // 1. Vérifier la connexion
    console.log('🔌 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('   ✅ Connexion réussie\n');
    
    // 2. Exporter toutes les tables dans l'ordre des dépendances
    console.log('📊 Export des données...\n');
    
    // Users (pas de dépendances)
    console.log('👤 Export des utilisateurs...');
    const users = await db.User.findAll({
      raw: true,
      order: [['id', 'ASC']]
    });
    console.log(`   ✅ ${users.length} utilisateur(s) exporté(s)`);
    
    // Tags (dépend de Users)
    console.log('🏷️  Export des tags...');
    const tags = await db.Tag.findAll({
      raw: true,
      order: [['id', 'ASC']]
    });
    console.log(`   ✅ ${tags.length} tag(s) exporté(s)`);
    
    // Todos (dépend de Users)
    console.log('📝 Export des todos...');
    const todos = await db.Todo.findAll({
      raw: true,
      order: [['id', 'ASC']]
    });
    console.log(`   ✅ ${todos.length} todo(s) exporté(s)`);
    
    // Jobs (dépend de Users)
    console.log('💼 Export des jobs...');
    const jobs = await db.Job.findAll({
      raw: true,
      order: [['id', 'ASC']]
    });
    console.log(`   ✅ ${jobs.length} job(s) exporté(s)`);
    
    // Comments (dépend de Jobs)
    console.log('💬 Export des commentaires...');
    const comments = await db.Comment.findAll({
      raw: true,
      order: [['id', 'ASC']]
    });
    console.log(`   ✅ ${comments.length} commentaire(s) exporté(s)`);
    
    // TodoTags (table de liaison, dépend de Todos et Tags)
    console.log('🔗 Export des relations TodoTags...');
    let todoTags = [];
    try {
      const todoTagsResult = await db.sequelize.query(
        'SELECT * FROM TodoTags ORDER BY todoId, tagId',
        { type: db.sequelize.QueryTypes.SELECT }
      );
      // sequelize.query avec SELECT retourne directement un tableau
      todoTags = Array.isArray(todoTagsResult) ? todoTagsResult : (todoTagsResult ? [todoTagsResult] : []);
    } catch (error) {
      // La table TodoTags peut ne pas exister ou être vide
      console.log(`   ℹ️  Aucune relation TodoTags trouvée ou table inexistante`);
      todoTags = [];
    }
    console.log(`   ✅ ${todoTags.length} relation(s) exportée(s)`);
    
    console.log('');
    
    // 3. Créer l'objet d'export
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        tables: {
          users: users.length,
          tags: tags.length,
          todos: todos.length,
          jobs: jobs.length,
          comments: comments.length,
          todoTags: todoTags.length
        }
      },
      data: {
        users,
        tags,
        todos,
        jobs,
        comments,
        todoTags
      }
    };
    
    // 4. Sauvegarder dans un fichier JSON
    const exportPath = path.join(__dirname, '../database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
    
    const stats = fs.statSync(exportPath);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    
    console.log('✅ Export terminé avec succès!');
    console.log('='.repeat(60));
    console.log(`📁 Fichier: ${exportPath}`);
    console.log(`📊 Taille: ${fileSizeInKB} KB`);
    console.log('');
    console.log('📋 Résumé:');
    console.log(`   👤 Utilisateurs: ${users.length}`);
    console.log(`   🏷️  Tags: ${tags.length}`);
    console.log(`   📝 Todos: ${todos.length}`);
    console.log(`   💼 Jobs: ${jobs.length}`);
    console.log(`   💬 Commentaires: ${comments.length}`);
    console.log(`   🔗 Relations TodoTags: ${todoTags.length}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Pour importer en production:');
    console.log('   node scripts/import-db.js');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'export:', error.message);
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
  exportDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { exportDatabase };

