'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('roles', {
        id: {
          allowNull: false,
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        name: {
          type: Sequelize.STRING,
          unique: true
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
      }) , {transaction};

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      console.error('Error creating table:', error);
      throw error
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.dropTable('roles' , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      console.error('Error dropping table' , error)
      throw error
    }
  }
};