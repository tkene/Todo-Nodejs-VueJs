/**
 * Script de diagnostic pour vérifier la table sessions
 */

require('dotenv').config();
const db = require('../models');

async function checkSessionsTable() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.');
    
    // Vérifier si la table existe
    const [tables] = await db.sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('sessions', 'Sessions')
    `);
    
    console.log('\n📋 Tables trouvées:', tables);
    
    if (tables.length > 0) {
      const tableName = tables[0].TABLE_NAME;
      console.log(`\n📊 Structure de la table ${tableName}:`);
      
      const [columns] = await db.sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.table(columns);
      
      // Compter les sessions
      const [count] = await db.sequelize.query(`
        SELECT COUNT(*) as count FROM \`${tableName}\`
      `);
      console.log(`\n📈 Nombre de sessions: ${count[0].count}`);
    } else {
      console.log('\n❌ Aucune table sessions trouvée!');
      console.log('💡 La table doit être créée.');
    }
    
    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkSessionsTable();

