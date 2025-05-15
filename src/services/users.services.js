const models = require('../../models')
const uuid = require('uuid')
const { hashPassword } = require('../../utils/bcrypt')
const { generateJWT } = require('../../utils/generate-jwt')
const { verify } = require('jsonwebtoken')

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

async function createUser ({username , email , password} , id) {
    const transaction = await models.sequelize.transaction()

    const userRole = await models.Roles.findOne({where:{name:'admin'}}).catch(err => {console.error(err)})
    
    try {
        let data = undefined
        let newUser = undefined
        if (id) {
            data = verify(id , process.env.JWT_SECRET)
        }
        const user = await models.Users.findOne({where:{id: data.user_id}})
        if (user) {
            newUser = await user.update({
                username,
                email,
                role_id: userRole.id,
                password: hashPassword(password)
            })
        } else {
            newUser = await models.Users.create({
                id: uuid.v4(),
                username,
                email,
                role_id: userRole.id,
                password: hashPassword(password)
            }, { transaction })
            await models.GameSettings.create({
                id: uuid.v4()
            },{transaction})
        }
        await transaction.commit()
        return newUser
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function createAnon() {
    const transaction = await models.sequelize.transaction()

    try {
    const anon = await models.Roles.findOne({
        where: {
            name: 'anon'
        }
    })
    // console.log(anon)
    const id = uuid.v4()
    const user = await models.Users.create({
            id,
            role_id: anon.id,
            username: `user${id}`,
            email: `${id}@anon.com`,
            password: id
        })
    
    await transaction.commit()

    const accesToken = await generateJWT(user.id , user.role_id , '1d')

    return {accesToken , user}
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function deleteUser(id) {
    const transaction = await models.sequelize.transaction()

    try {
        const user = await models.Users.findOne({where:{id}})
        await user.destroy({transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function updateGameSettingsByUserId({cellsHighlight, numbersHighlight}, user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const gameSettings = await models.GameSettings.findOne({
            where:{
                user_id
            }
        })
        await gameSettings.update({
            cellsHighlight,
            numbersHighlight
        }, {transaction})

        await transaction.commit()

        return gameSettings
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    findUserByUserName,
    createUser,
    findUserByEmail,
    createAnon,
    deleteUser,
    updateGameSettingsByUserId
}