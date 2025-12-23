'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajouter la colonne userId
    await queryInterface.addColumn('tags', 'userId', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    
    // Note: La contrainte unique sur 'name' sera gérée au niveau de l'application
    // (chaque utilisateur peut avoir ses propres tags avec le même nom)
    // En SQLite, supprimer une contrainte unique nécessite de recréer la table,
    // ce qui est complexe. On laisse la contrainte au niveau base de données
    // et on gère l'unicité au niveau application avec userId + name
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tags', 'userId');
  }
};

