require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database');

/**
 * Script pour vérifier quelle base de données est utilisée
 */
async function checkDatabase() {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];

  console.log('🔍 Vérification de la configuration de la base de données');
  console.log('='.repeat(60));
  console.log(`Environnement: ${env}`);
  console.log(`Dialecte: ${dbConfig.dialect}`);

  if (dbConfig.dialect === 'mysql') {
    console.log('\n✅ Configuration MySQL détectée:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Username: ${dbConfig.username}`);

    // Tester la connexion
    try {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        logging: false
      });

      await sequelize.authenticate();
      console.log('\n✅ Connexion à MySQL réussie !');
      
      // Vérifier les tables
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${dbConfig.database}'
        ORDER BY table_name
      `);

      console.log(`\n📊 Tables trouvées (${tables.length}):`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });

      await sequelize.close();
    } catch (error) {
      console.error('\n❌ Erreur de connexion à MySQL:', error.message);
      console.error('\n💡 Vérifiez vos variables d\'environnement dans server/.env:');
      console.error('   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    }
  } else {
    console.log('\n⚠️  Configuration SQLite détectée (fallback)');
    console.log(`   Fichier: ${dbConfig.storage}`);
    console.log('\n💡 Pour utiliser MySQL, configurez les variables suivantes dans server/.env:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_PORT=3306');
    console.log('   DB_NAME=job-tracker-2026');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=votre-mot-de-passe');
  }

  console.log('\n' + '='.repeat(60));
}

if (require.main === module) {
  checkDatabase().catch(console.error);
}

module.exports = { checkDatabase };

