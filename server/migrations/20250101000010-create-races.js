'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('races', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      courseId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Identifiant unique de la course (ex: R1C8)'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nom de la course'
      },
      surface: {
        type: Sequelize.ENUM('PSF', 'Herbe'),
        allowNull: false,
        comment: 'Type de surface (PSF ou Herbe)'
      },
      hippodrome: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nom de l\'hippodrome (ex: Deauville)'
      },
      corde: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Position de la corde'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('races');
  }
};

