'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('multiplayer_games', {
        id: {
          allowNull: false,
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        sudokuId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'sudoku_id',
          references: {
            model: 'sudokus',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        puzzleId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'puzzle_id',
          references: {
            model: 'puzzles',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        grid: {
          type: Sequelize.JSON,
          allowNull: false
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0 // 0 -> unsolved , 1 -> solved , 2 -> failed 
        },
        time: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
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
      } , {transaction});
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('multiplayer_games' , {transaction});
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};