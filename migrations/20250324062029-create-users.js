'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('users', {
        id: {
          allowNull: false,
          unique: true,
          primaryKey: true,
          type: Sequelize.UUID
        },
        username: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: [8, 20]
          }
        },
        roleId: {
          allowNull: false,
          type: Sequelize.UUID,
          field: 'role_id',
          references: {
            model: 'roles',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
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
      await queryInterface.dropTable('users' , {transaction});

      await transaction.commit()
    } catch (error) {
      await transaction.rollback();
      console.error('Error dropping table:', error);
      throw error
    }
  }
};