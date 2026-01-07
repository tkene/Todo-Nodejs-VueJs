const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Configuration Sequelize selon l'environnement
const sequelizeConfig = {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging
};

// Pour SQLite, ajouter storage
if (dbConfig.dialect === 'sqlite' && dbConfig.storage) {
  sequelizeConfig.storage = dbConfig.storage;
}

// Pour MySQL, ajouter les paramètres de connexion
if (dbConfig.dialect === 'mysql') {
  sequelizeConfig.host = dbConfig.host;
  sequelizeConfig.port = dbConfig.port;
  sequelizeConfig.database = dbConfig.database;
  sequelizeConfig.username = dbConfig.username;
  sequelizeConfig.password = dbConfig.password;
  if (dbConfig.dialectOptions) {
    sequelizeConfig.dialectOptions = dbConfig.dialectOptions;
  }
}

const sequelize = new Sequelize(sequelizeConfig);

// Import des modèles
const Tag = require('./Tag')(sequelize, DataTypes);
const Todo = require('./Todo')(sequelize, DataTypes);
const Job = require('./Job')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);

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

const db = {
  sequelize,
  Sequelize,
  Tag,
  Todo,
  Job,
  Comment,
  User
};

module.exports = db;

