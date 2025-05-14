'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('game_settings', {
        id: {
          allowNull: false,
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
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
      },{transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('game_settings', {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
    }
  }
};