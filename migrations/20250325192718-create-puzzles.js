'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('puzzles', {
        id: {
          allowNull: false,
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        sudokuId: {
          type: Sequelize.UUID,
          field: 'sudoku_id',
          references: {
            model: 'sudokus',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        difficulty: {
          type: Sequelize.INTEGER, // 0 -> novice, 1 -> easy, 2 -> normal, 3 -> hard, 4 -> expert, 5 -> master
          allowNull: false
        },
        number: {
          type: Sequelize.STRING,
          unique: true
        },
        grid: {
          type: Sequelize.JSON
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'created_at'
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'updated_at'
        }
      } , {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating table:', error);
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('puzzles' , {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error dropping table:', error);
      throw error
    }
    }
};