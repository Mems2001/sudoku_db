const models = require('../../models')
const uuid = require('uuid')
const { hashPassword } = require('../../utils/bcrypt')

async function findUserByUserName (userName) {
    return models.Users.findOne({
        where: {
            userName
        }
    })
}

async function createUser ({userName , email , password}) {
    const transaction = await models.sequelize.transaction()
    try {
        const newUser = await models.Users.create({
            id: uuid.v4(),
            userName,
            email,
            password: hashPassword(password)
        }, { transaction })
        await transaction.commit()
        return newUser
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    findUserByUserName,
    createUser
}