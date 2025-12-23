/**
 * Script pour vérifier et corriger l'attribution des données aux utilisateurs
 * - Vérifie si les colonnes userId existent
 * - Attribue toutes les données existantes à jobsecker@jobsecker.com
 */

require('dotenv').config();
const db = require('../models');
const userModule = require('../modules/users');

async function fixUserAssignments() {
  try {
    console.log('🔄 Vérification et correction de l\'attribution des données...\n');
    
    // 1. Synchroniser la base de données pour s'assurer que les colonnes existent
    await db.sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée\n');
    
    // 2. Trouver l'utilisateur jobsecker@jobsecker.com
    const user = await userModule.findUserByEmail('jobsecker@jobsecker.com');
    
    if (!user) {
      console.error('❌ Utilisateur jobsecker@jobsecker.com non trouvé!');
      console.log('💡 Exécutez d\'abord: node scripts/create-initial-users.js');
      process.exit(1);
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})\n`);
    
    // 3. Vérifier et ajouter userId aux todos s'il manque
    const todosWithoutUser = await db.Todo.findAll({ where: { userId: null } });
    if (todosWithoutUser.length > 0) {
      await db.Todo.update(
        { userId: user.id },
        { where: { userId: null } }
      );
      console.log(`✅ ${todosWithoutUser.length} todos rattachés à l'utilisateur`);
    } else {
      console.log('ℹ️  Tous les todos ont déjà un userId');
    }
    
    // 4. Vérifier et ajouter userId aux jobs s'il manque
    const jobsWithoutUser = await db.Job.findAll({ where: { userId: null } });
    if (jobsWithoutUser.length > 0) {
      await db.Job.update(
        { userId: user.id },
        { where: { userId: null } }
      );
      console.log(`✅ ${jobsWithoutUser.length} jobs rattachés à l'utilisateur`);
    } else {
      console.log('ℹ️  Tous les jobs ont déjà un userId');
    }
    
    // 5. Vérifier et ajouter userId aux tags s'il manque
    const tagsWithoutUser = await db.Tag.findAll({ where: { userId: null } });
    if (tagsWithoutUser.length > 0) {
      await db.Tag.update(
        { userId: user.id },
        { where: { userId: null } }
      );
      console.log(`✅ ${tagsWithoutUser.length} tags rattachés à l'utilisateur`);
    } else {
      console.log('ℹ️  Tous les tags ont déjà un userId');
    }
    
    // 6. Afficher un résumé
    const totalTodos = await db.Todo.count({ where: { userId: user.id } });
    const totalJobs = await db.Job.count({ where: { userId: user.id } });
    const totalTags = await db.Tag.count({ where: { userId: user.id } });
    
    console.log('\n📊 Résumé final:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Todos: ${totalTodos}`);
    console.log(`   Jobs: ${totalJobs}`);
    console.log(`   Tags: ${totalTags}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Correction terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  fixUserAssignments()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fixUserAssignments };

