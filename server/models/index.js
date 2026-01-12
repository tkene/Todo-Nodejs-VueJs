const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

// Configuration MySQL uniquement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Configuration Sequelize pour MySQL
const sequelizeConfig = {
  dialect: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  logging: dbConfig.logging,
  define: {
    freezeTableName: true, // Forcer l'utilisation exacte des noms de tables
    underscored: false
  }
};

if (dbConfig.dialectOptions) {
  sequelizeConfig.dialectOptions = dbConfig.dialectOptions;
}

const sequelize = new Sequelize(sequelizeConfig);

// Import des modèles
const Tag = require('./Tag')(sequelize, DataTypes);
const Todo = require('./Todo')(sequelize, DataTypes);
const Job = require('./Job')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
// Import du modèle Session
const Session = require('./Session')(sequelize, DataTypes);

// Enregistrer le modèle Session avec le nom 'sessions' (minuscule) pour connect-session-sequelize
// Le store connect-session-sequelize cherche le modèle dans sequelize.models['sessions']
// Cette enregistrement est nécessaire car le store utilise le nom de table comme clé
sequelize.models.sessions = Session;

// Définir les associations
// Relation many-to-many entre Todo et Tag
Todo.belongsToMany(Tag, {
  through: 'TodoTags',
  foreignKey: 'todoId',
  otherKey: 'tagId',
  as: 'tags'
});

Tag.belongsToMany(Todo, {
  through: 'TodoTags',
  foreignKey: 'tagId',
  otherKey: 'todoId',
  as: 'todos'
});

// Relation one-to-many entre Job et Comment
Job.hasMany(Comment, {
  foreignKey: 'jobId',
  as: 'comments'
});

Comment.belongsTo(Job, {
  foreignKey: 'jobId',
  as: 'job'
});

// Relations avec User
User.hasMany(Todo, {
  foreignKey: 'userId',
  as: 'todos'
});

Todo.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Job, {
  foreignKey: 'userId',
  as: 'jobs'
});

Job.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Tag, {
  foreignKey: 'userId',
  as: 'tags'
});

Tag.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

/**
 * Objet contenant tous les modèles Sequelize et l'instance sequelize
 * 
 * @typedef {Object} DatabaseModels
 * @property {Sequelize} sequelize - Instance Sequelize
 * @property {typeof Sequelize} Sequelize - Classe Sequelize
 * @property {Model} Tag - Modèle Tag
 * @property {Model} Todo - Modèle Todo
 * @property {Model} Job - Modèle Job
 * @property {Model} Comment - Modèle Comment
 * @property {Model} User - Modèle User
 * @property {Model} Session - Modèle Session (pour synchronisation manuelle)
 */
const db = {
  sequelize,
  Sequelize,
  Tag,
  Todo,
  Job,
  Comment,
  User,
  Session, // Exporté pour synchronisation manuelle dans init-database.js
};

module.exports = db;

