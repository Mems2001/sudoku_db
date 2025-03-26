const models = require('../../models')
const uuid = require('uuid')
const { hashPassword } = require('../../utils/bcrypt')

async function findUserByUserName (username) {
    return models.Users.findOne({
        where: {
            username
        }
    })
}

async function findUserByEmail (email) {
    return models.Users.findOne({
        where: {
            email
        }
    })
}

async function createUser ({username , email , password}) {
    const transaction = await models.sequelize.transaction()

    const userRole = await models.Roles.findOne({where:{name:'admin'}}).catch(err => {console.error(err)})
    
    try {
        const newUser = await models.Users.create({
            id: uuid.v4(),
            username,
            email,
            role_id: userRole.id,
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
    createUser,
    findUserByEmail
}