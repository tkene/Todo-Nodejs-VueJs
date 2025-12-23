'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TodoTags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      todoId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'todos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Index unique pour éviter les doublons
    await queryInterface.addIndex('TodoTags', ['todoId', 'tagId'], {
      unique: true,
      name: 'todo_tags_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TodoTags');
  }
};

