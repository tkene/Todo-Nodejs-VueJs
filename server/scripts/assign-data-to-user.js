/**
 * Script pour rattacher toutes les données existantes (todos, jobs, tags)
 * à l'utilisateur ${process.env.ADMIN_EMAIL}
 */

require('dotenv').config();
const db = require('../models');
const userModule = require('../modules/users');

async function assignDataToUser() {
  try {
    console.log('🔄 Démarrage de l\'attribution des données à l\'utilisateur...');
    
    // 1. Trouver l'utilisateur ${process.env.ADMIN_EMAIL}
    const user = await userModule.findUserByEmail(process.env.ADMIN_EMAIL);
    
    if (!user) {
      console.error('❌ Utilisateur ${process.env.ADMIN_EMAIL} non trouvé!');
      console.log('💡 Assurez-vous que l\'utilisateur ${process.env.ADMIN_EMAIL} existe. Vous pouvez le créer avec le script create-initial-users.js');
      process.exit(1);
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);
    
    // 2. Rattacher tous les todos sans userId
    const todosUpdated = await db.Todo.update(
      { userId: user.id },
      { where: { userId: null } }
    );
    console.log(`✅ ${todosUpdated[0]} todos rattachés à l'utilisateur`);
    
    // 3. Rattacher tous les jobs sans userId
    const jobsUpdated = await db.Job.update(
      { userId: user.id },
      { where: { userId: null } }
    );
    console.log(`✅ ${jobsUpdated[0]} jobs rattachés à l'utilisateur`);
    
    // 4. Rattacher tous les tags sans userId
    const tagsUpdated = await db.Tag.update(
      { userId: user.id },
      { where: { userId: null } }
    );
    console.log(`✅ ${tagsUpdated[0]} tags rattachés à l'utilisateur`);
    
    // 5. Afficher un résumé
    const totalTodos = await db.Todo.count({ where: { userId: user.id } });
    const totalJobs = await db.Job.count({ where: { userId: user.id } });
    const totalTags = await db.Tag.count({ where: { userId: user.id } });
    
    console.log('\n📊 Résumé:');
    console.log(`   - Todos: ${totalTodos}`);
    console.log(`   - Jobs: ${totalJobs}`);
    console.log(`   - Tags: ${totalTags}`);
    
    console.log('\n✅ Attribution terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'attribution des données:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  assignDataToUser()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { assignDataToUser };

