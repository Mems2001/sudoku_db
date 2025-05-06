'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('players', {
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
        gameId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'game_id',
          references: {
            model: 'games',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        grid: {
          type: Sequelize.JSON,
          allowNull: false
        },
        number: {
          type: Sequelize.STRING,
          allowNull: false
        },
        errors: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0 // 0 -> unfinished , 1 -> winner , 2 -> loser
        },
        host: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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

      (await transaction).commit()
    } catch(error) {
      (await transaction).rollback()
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('players' , {transaction});
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};