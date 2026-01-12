/**
 * Modèle Session pour le stockage des sessions Express
 * Compatible avec connect-session-sequelize
 * 
 * Structure de la table:
 * - sid (STRING, PK): Identifiant unique de la session
 * - expires (DATE): Date d'expiration de la session
 * - data (TEXT): Données de la session sérialisées en JSON
 * 
 * Note: Pas de colonnes createdAt/updatedAt (timestamps: false)
 * 
 * @param {Sequelize} sequelize - Instance Sequelize
 * @param {DataTypes} DataTypes - Types de données Sequelize
 * @returns {Model} Modèle Session
 */
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      comment: 'Session ID - identifiant unique de la session',
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date d\'expiration de la session',
    },
    data: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Données de la session sérialisées en JSON',
    },
  }, {
    tableName: 'sessions',
    freezeTableName: true, // Empêcher Sequelize de pluraliser le nom de table
    timestamps: false, // Pas de colonnes createdAt/updatedAt
    createdAt: false, // Forcer l'exclusion de createdAt
    updatedAt: false, // Forcer l'exclusion de updatedAt
    underscored: false,
    comment: 'Table de stockage des sessions Express',
  });

  return Session;
};

