'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('profiles', {
        id: {
          allowNull: false, 
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        gameStats: {
          type: Sequelize.JSONB,
          field: "game_stats",
          defaultValue: {}
        },
        cellsHighlight: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'cells_highlight'
        },
        numbersHighlight: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'numbers_highlight'
        },
        highlightColor: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "blue",
          field: "highlight_color"
        },
        inputMode: {
          type: Sequelize.INTEGER, // 0 -> Buttons, 1 -> Keyboard
          allowNull: false,
          defaultValue: 0,
          field: 'input_mode'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'created_at',
          defaultValue: new Date()
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'updated_at',
          defaultValue: new Date()
        }
      }, {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('profiles')
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};