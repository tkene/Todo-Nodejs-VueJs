'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('horses', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      raceId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'races',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Référence à la course'
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Numéro du cheval dans la course'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nom du cheval'
      },
      musique: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Musique du cheval (ex: 1-2-3)'
      },
      poids: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Poids porté par le cheval'
      },
      cote: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Cote actuelle du cheval'
      },
      coteInitiale: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Cote initiale du cheval'
      },
      performanceScore: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Score de performance calculé'
      },
      aptitudPSF: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Aptitude à la surface PSF'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Index pour améliorer les performances
    await queryInterface.addIndex('horses', ['raceId'], {
      name: 'idx_horses_raceId'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('horses');
  }
};

