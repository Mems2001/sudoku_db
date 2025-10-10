const models = require('../../models')
const uuid = require('uuid')
const { hashPassword } = require('../../utils/bcrypt')
const { generateJWT } = require('../../utils/generate-jwt')
const { verify } = require('jsonwebtoken')
const AuthServices = require('../services/auth.services')

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
        let anonData = undefined
        let newUser = undefined
        if (id) {
            anonData = verify(id , process.env.JWT_SECRET)
        }
        // We verify if the user was using a anon user, if so, we update it instead of creating a new user.
        const user = await models.Users.findOne({where:{id: anonData.user_id}})
        if (user) {
            newUser = await user.update({
                username,
                email,
                role_id: userRole.id,
                password: hashPassword(password)
            })
            await models.GameSettings.create({
                id: uuid.v4(),
                user_id: newUser.id
            },{transaction})
            // Anon game reasignation to the new user
            await AuthServices.reasignGames(anonData.user_id, newUser.id)
        } else {
            newUser = await models.Users.create({
                id: uuid.v4(),
                username,
                email,
                role_id: userRole.id,
                password: hashPassword(password)
            }, { transaction })
            await models.GameSettings.create({
                id: uuid.v4(),
                user_id: newUser.id
            },{transaction})
        }
        await transaction.commit()
        return newUser
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function returnAnon({pre_id}) {
    const transaction = await models.sequelize.transaction()

    try {
        const anon = await models.Roles.findOne({
            where: {
                name: 'anon'
            }
        })

        let user
        user = await models.Users.findOne({
            where: {
                id: pre_id
            }
        })

        if (!user) {
            user = await models.Users.create({
                    id: pre_id,
                    role_id: anon.id,
                    username: `anon${pre_id}`,
                    email: `${pre_id}@anon.com`,
                    password: pre_id
                }, {transaction})
        }
        
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

async function updateGameSettingsByUserId({cellsHighlight, numbersHighlight, highlightColor, inputMode}, user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const gameSettings = await models.GameSettings.findOne({
            where:{
                user_id
            }
        })
        await gameSettings.update({
            cells_highlight: cellsHighlight,
            numbers_highlight: numbersHighlight,
            highlight_color: highlightColor,
            input_mode: inputMode
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
    returnAnon,
    deleteUser,
    updateGameSettingsByUserId
}