require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration SQLite (source)
const SQLITE_PATH = path.join(__dirname, '../database.sqlite');

// Configuration MySQL (destination)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'job-tracker-2026',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: console.log
};

// Fonction pour se connecter à SQLite
function connectSQLite() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(SQLITE_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// Fonction pour exécuter une requête SQLite
function querySQLite(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Fonction pour vérifier si une table existe dans SQLite
function tableExistsSQLite(db, tableName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      }
    );
  });
}

// Fonction pour migrer une table
async function migrateTable(sqliteDb, mysqlSequelize, tableName, order = 0) {
  try {
    const exists = await tableExistsSQLite(sqliteDb, tableName);
    if (!exists) {
      console.log(`⚠️  Table ${tableName} n'existe pas dans SQLite, ignorée.`);
      return 0;
    }

    console.log(`\n📦 Migration de la table: ${tableName}`);
    
    // Récupérer toutes les données de SQLite
    const rows = await querySQLite(sqliteDb, `SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`   ✓ Table vide, aucune donnée à migrer.`);
      return 0;
    }

    console.log(`   📊 ${rows.length} enregistrements trouvés`);

    // Vérifier si la table existe dans MySQL
    const [results] = await mysqlSequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = '${mysqlConfig.database}' 
      AND table_name = '${tableName}'
    `);

    if (results[0].count === 0) {
      console.log(`   ⚠️  Table ${tableName} n'existe pas dans MySQL. Exécutez d'abord les migrations Sequelize.`);
      return 0;
    }

    // Vérifier les enregistrements existants
    const [existingCount] = await mysqlSequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    const count = existingCount[0].count;

    if (count > 0) {
      console.log(`   ⚠️  Table ${tableName} contient déjà ${count} enregistrements.`);
      console.log(`   → Les doublons seront automatiquement ignorés (ON DUPLICATE KEY UPDATE).`);
    }

    return await insertData(mysqlSequelize, tableName, rows);
  } catch (error) {
    console.error(`   ❌ Erreur lors de la migration de ${tableName}:`, error.message);
    throw error;
  }
}

// Fonction pour insérer les données
async function insertData(mysqlSequelize, tableName, rows) {
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      // Convertir les valeurs pour MySQL
      const values = {};
      for (const [key, value] of Object.entries(row)) {
        // Gérer les valeurs NULL
        if (value === null || value === undefined) {
          values[key] = null;
        } else if (typeof value === 'boolean') {
          // SQLite stocke les booléens comme 0/1, MySQL accepte TINYINT(1)
          values[key] = value ? 1 : 0;
        } else if (value instanceof Date) {
          values[key] = value;
        } else {
          values[key] = value;
        }
      }

      // Construire la requête INSERT
      const columns = Object.keys(values).join(', ');
      const placeholders = Object.keys(values).map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE id=id`;
      
      await mysqlSequelize.query(sql, {
        replacements: Object.values(values)
      });
      inserted++;
    } catch (error) {
      // Ignorer les erreurs de clé dupliquée
      if (error.message.includes('Duplicate entry') || error.message.includes('PRIMARY')) {
        skipped++;
      } else {
        console.error(`   ⚠️  Erreur lors de l'insertion:`, error.message);
        skipped++;
      }
    }
  }

  console.log(`   ✓ ${inserted} enregistrements insérés, ${skipped} ignorés (doublons)`);
  return inserted;
}

// Fonction pour migrer la table de liaison TodoTags
async function migrateTodoTags(sqliteDb, mysqlSequelize) {
  try {
    const exists = await tableExistsSQLite(sqliteDb, 'TodoTags');
    if (!exists) {
      console.log(`\n⚠️  Table TodoTags n'existe pas dans SQLite, ignorée.`);
      return 0;
    }

    console.log(`\n📦 Migration de la table de liaison: TodoTags`);
    
    const rows = await querySQLite(sqliteDb, `SELECT * FROM TodoTags`);
    
    if (rows.length === 0) {
      console.log(`   ✓ Table vide, aucune donnée à migrer.`);
      return 0;
    }

    console.log(`   📊 ${rows.length} relations trouvées`);

    // Vérifier si la table existe dans MySQL
    const [results] = await mysqlSequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = '${mysqlConfig.database}' 
      AND table_name = 'TodoTags'
    `);

    if (results[0].count === 0) {
      console.log(`   ⚠️  Table TodoTags n'existe pas dans MySQL. Exécutez d'abord les migrations Sequelize.`);
      return 0;
    }

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const sql = `INSERT INTO TodoTags (todoId, tagId) VALUES (?, ?) ON DUPLICATE KEY UPDATE todoId=todoId`;
        await mysqlSequelize.query(sql, {
          replacements: [row.todoId, row.tagId]
        });
        inserted++;
      } catch (error) {
        if (error.message.includes('Duplicate entry')) {
          skipped++;
        } else {
          console.error(`   ⚠️  Erreur:`, error.message);
          skipped++;
        }
      }
    }

    console.log(`   ✓ ${inserted} relations insérées, ${skipped} ignorées (doublons)`);
    return inserted;
  } catch (error) {
    console.error(`   ❌ Erreur lors de la migration de TodoTags:`, error.message);
    throw error;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de la migration SQLite → MySQL');
  console.log('='.repeat(60));

  // Vérifier les variables d'environnement
  if (!process.env.DB_HOST) {
    console.error('❌ Erreur: DB_HOST n\'est pas défini dans le fichier .env');
    console.error('   Veuillez configurer MySQL dans server/.env');
    process.exit(1);
  }

  let sqliteDb = null;
  let mysqlSequelize = null;

  try {
    // Connexion à SQLite
    console.log('\n📂 Connexion à SQLite...');
    sqliteDb = await connectSQLite();
    console.log('   ✓ Connecté à SQLite');

    // Connexion à MySQL
    console.log('\n📂 Connexion à MySQL...');
    mysqlSequelize = new Sequelize(mysqlConfig);
    await mysqlSequelize.authenticate();
    console.log('   ✓ Connecté à MySQL');

    // Vérifier que la base de données existe
    console.log(`\n📊 Base de données: ${mysqlConfig.database}`);

    // Migrer les tables dans l'ordre (respecter les clés étrangères)
    console.log('\n🔄 Début de la migration des données...');
    console.log('='.repeat(60));

    // 1. Users (doit être en premier car référencé par les autres)
    await migrateTable(sqliteDb, mysqlSequelize, 'users', 1);

    // 2. Tags (référence users)
    await migrateTable(sqliteDb, mysqlSequelize, 'tags', 2);

    // 3. Todos (référence users)
    await migrateTable(sqliteDb, mysqlSequelize, 'todos', 3);

    // 4. Jobs (référence users)
    await migrateTable(sqliteDb, mysqlSequelize, 'jobs', 4);

    // 5. Comments (référence jobs)
    await migrateTable(sqliteDb, mysqlSequelize, 'comments', 5);

    // 6. TodoTags (table de liaison)
    await migrateTodoTags(sqliteDb, mysqlSequelize);

    // 7. Quiz tables (si elles existent)
    await migrateTable(sqliteDb, mysqlSequelize, 'quiz_questions', 7);
    await migrateTable(sqliteDb, mysqlSequelize, 'quiz_scores', 8);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration terminée avec succès !');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    // Fermer les connexions
    if (sqliteDb) {
      sqliteDb.close((err) => {
        if (err) console.error('Erreur lors de la fermeture de SQLite:', err);
      });
    }
    if (mysqlSequelize) {
      await mysqlSequelize.close();
    }
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

