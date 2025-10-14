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

async function createUser ({username , email , password, cellsHighlight, numbersHighlight, highlightColor, inputMode} , id) {
    const transaction = await models.sequelize.transaction()

    const userRole = await models.Roles.findOne({where:{name:'admin'}}).catch(err => {console.error(err)})
    
    try {
        let anonData = undefined
        let newUser = undefined
        if (id) {
            anonData = verify(id , process.env.JWT_SECRET)
        }
        // We verify if the user was using a anon user, if so, we update it instead of creating a new user. This also automatically "reasign" any anon game.
        const user = await models.Users.findOne({where:{id: anonData.user_id}})
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

            await models.Profiles.create({
                id: uuid.v4(),
                user_id: newUser.id,
                input_mode: inputMode,
                cells_highlight: cellsHighlight,
                numbers_highlight: numbersHighlight,
                highlight_color: highlightColor
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
            
            await models.Profiles.create({
                id: uuid.v4(),
                user_id: user.id
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

module.exports = {
    findUserByUserName,
    createUser,
    findUserByEmail,
    returnAnon,
    deleteUser
}