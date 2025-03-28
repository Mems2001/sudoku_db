'use strict';
const uuid = require('uuid')
const models = require('../models');
const { Op } = require('sequelize');
const {hashPassword} = require('../utils/bcrypt')

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
   const transaction = await queryInterface.sequelize.transaction()

   try {
       const admin = await models.Roles.findOne({
        where: {
            name: 'admin'
        }
       }).catch(err => {console.error(err)})
       console.log(admin)
    
       const users = {
        id: uuid.v4(),
        username: 'mems2001',
        email: 'mems2001code@gmail.com',
        password: hashPassword('mems200195'),
        role_id: admin.id
       }

       await queryInterface.bulkInsert('users' , users , {transaction})

       await transaction.commit()
   } catch(error) {
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
        const admin = await models.Roles.findOne({
            where: {
                name: 'admin'
            }
        })
        await queryInterface.bulkDelete('users' , {
            role_id: {
                [Op.eq] : admin.id
            }
        } , {transaction})

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
  }
};
