'use strict';
const { Op } = require('sequelize');
const uuid = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const roles = [
      {
        id: uuid.v4(),
        name: 'admin'
      } ,
      {
        id: uuid.v4(),
        name: 'user'
      }
    ]

    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.bulkInsert('roles' , roles , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.bulkDelete('roles' , {
        name: {
          [Op.ne] : ''
        }
      } , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};
