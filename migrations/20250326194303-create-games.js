'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('games', {
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
          foreignKey: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        sudokuId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'sudoku_id',
          references: {
            model: 'sudokus',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        puzzleId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'puzzle_id',
          references: {
            model: 'puzzles',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        number: {
          type: Sequelize.STRING,
          allowNull: false
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
        errors: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 3
          }
        },
        time: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        // attempts: {
        //   type: Sequelize.INTEGER,
        //   defaultValue: 1,
        //   allowNull: false
        // },
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
      } , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('games' , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};