'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forum_insights', {
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
      horseId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'horses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Référence au cheval'
      },
      sentiment: {
        type: Sequelize.ENUM('très_positif', 'positif', 'neutre', 'négatif', 'très_négatif'),
        allowNull: false,
        defaultValue: 'neutre',
        comment: 'Sentiment global du forum sur le cheval'
      },
      sentimentScore: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Score numérique du sentiment (-100 à +100)'
      },
      commentCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Nombre de commentaires analysés'
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
    await queryInterface.addIndex('forum_insights', ['raceId'], {
      name: 'idx_forum_insights_raceId'
    });
    await queryInterface.addIndex('forum_insights', ['horseId'], {
      name: 'idx_forum_insights_horseId'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('forum_insights');
  }
};

