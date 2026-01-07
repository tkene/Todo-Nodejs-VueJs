require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: console.log
  },
  production: {
    // Utilise MySQL si les variables sont définies, sinon SQLite (fallback)
    dialect: process.env.DB_HOST ? 'mysql' : 'sqlite',
    // Configuration MySQL
    ...(process.env.DB_HOST ? {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 28340,
      database: process.env.DB_NAME || 'zeabur',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      dialectOptions: {
        // Options pour MySQL
        connectTimeout: 60000
      }
    } : {
      // Fallback SQLite si MySQL n'est pas configuré
      storage: path.join(__dirname, '../database.sqlite')
    }),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  }
};

