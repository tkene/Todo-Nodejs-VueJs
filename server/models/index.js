const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging
});

// Import des modèles
const Tag = require('./Tag')(sequelize, DataTypes);
const Todo = require('./Todo')(sequelize, DataTypes);
const Job = require('./Job')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Race = require('./Race')(sequelize, DataTypes);
const Horse = require('./Horse')(sequelize, DataTypes);
const ForumInsight = require('./ForumInsight')(sequelize, DataTypes);

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

// Relations pour les courses PMU
// Race -> Horses (One-to-Many)
Race.hasMany(Horse, {
  foreignKey: 'raceId',
  as: 'horses'
});

Horse.belongsTo(Race, {
  foreignKey: 'raceId',
  as: 'race'
});

// Horse -> ForumInsight (One-to-Many)
Horse.hasMany(ForumInsight, {
  foreignKey: 'horseId',
  as: 'forumInsights'
});

ForumInsight.belongsTo(Horse, {
  foreignKey: 'horseId',
  as: 'horse'
});

// Race -> ForumInsight (One-to-Many)
Race.hasMany(ForumInsight, {
  foreignKey: 'raceId',
  as: 'forumInsights'
});

ForumInsight.belongsTo(Race, {
  foreignKey: 'raceId',
  as: 'race'
});

const db = {
  sequelize,
  Sequelize,
  Tag,
  Todo,
  Job,
  Comment,
  User,
  Race,
  Horse,
  ForumInsight
};

module.exports = db;

