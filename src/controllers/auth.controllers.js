const usersServices = require('../services/users.services')
const authServices = require('../services/auth.services')
const rolesServices = require('../services/roles.services')
const models = require('../../models')
const { comparePasswords } = require('../../utils/bcrypt')
const { generateJWT } = require('../../utils/generate-jwt')
const {verify} = require('jsonwebtoken')

/**
 * The login process first checks if the user exists. Then, verifies the password. But then it runs the anon verification process. Which is code that identifies if the user that's trying to log in was using an anon user. If so, it transfers all the games played as anon to the user profile and finally deletes the anon user. Only then it sets the jwt 'sudoku21-access-token' cookie.
 * @param {*} req.body The body request object that conteins the following props:
 * @property useUsername - A boolean that informs us if the user is trying to login with his userName (true) or email (false)
 * @property username
 * @property email
 * @property password
 * @returns 
 */
async function login (req, res) {
    const {useUsername , username , email , password} = req.body

    try {
        //User existence verification
        let user
        if (useUsername) {
            user = await usersServices.findUserByUserName(username)
            if (!user) {
                return res.status(404).json({
                    message: "username not found",
                    class: "login",
                    type: 1
                })
            }
        } else {
            user = await usersServices.findUserByEmail(email)
            if (!user) {
                return res.status(404).json({
                    message: "email not found",
                    class: "login",
                    type: 1
                })
            }
        }
        //Password validation
        const validatePassword = await comparePasswords(password , user.password)
        if (!validatePassword) {
            return res.status(400).json({
                message: "wrong password",
                class: "login",
                type: 2
            })
        }
        // Anon verification
        const cookie = req.cookies['sudoku21-access-token']
        // console.log(cookie)
        if (cookie) {
            console.log('---> Anon verification')
            const data = verify(cookie , process.env.JWT_SECRET)
            const role = await rolesServices.findRoleById(data.role_id)
            // console.log(data)
            // console.log(role)
    
            if (role && role.name === 'anon') {
                authServices.reasignGames(data.user_id , user.id)
                    .then(() => {
                        console.log('---> Games reassigned')
                        usersServices.deleteUser(data.user_id)
                        req.session.user = null
                        // Clear cookie here is an option but performance negative
                    })
            }
        }
        //JWT generation
        const accesToken = await generateJWT(user.id , user.role_id , '1d')
        // const refreshToken = await generateJWT(user.id , user.role_id , '7 d')
        res.setCookie('sudoku21-access-token', accesToken)
        // res.cookie('refresh-token' , refreshToken)
        res.status(200).json({
                message: "user logged in"
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong, talk to any administrator",
            class: "login",
            type: 0
        });
    }
}

function logout (req , res) {
    try {
        req.session.user = null
        res.delCookie('sudoku21-access-token')
        res.status(200).json({
            message: "User logged out"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong, talk to any administrator",
            class: 'logout',
            type: 0
        })
    }
}

/**
 * This function is in charge of verify is the user session is valid, using an "sudoku21-access-token" cookie. IF so, ir returns his id, role, and game settings
 * @return If the authentication succeeds, it returns the user's id and role. Otherwise it deletes the cookie if it exists.
 */
async function authenticateSession (req ,res) {
    const cookie = req.cookies['sudoku21-access-token']
    console.log('---> Authenticating session with cookie:',cookie)
    
    try {
        if (cookie) {
            const data = verify(cookie , process.env.JWT_SECRET)
            if (!data) {
                req.session.user = null
                res.status(400).json({
                    message: 'Session expired',
                    class: "authentication",
                    type: 1
                })
            }
            const user = await models.Users.findOne({
                where: {
                    id: data.user_id
                }
            })
            const role = await models.Roles.findOne({
                where: {
                    id: data.role_id
                }
            })
            const gameSettings = await models.Profiles.findOne({
                where: {
                    user_id: data.user_id
                }
            })
            // console.log('game_settings:' , gameSettings)

            if (role && user) {
                req.session.user = user
                res.status(200).json({
                    message: "Session authenticated",
                    user_id: user.id,
                    role: role.name,
                    settings: {
                        cells_highlight: gameSettings && gameSettings.cells_highlight ? gameSettings.cells_highlight : true,
                        numbers_highlight: gameSettings && gameSettings.numbers_highlight ? gameSettings.numbers_highlight : true,
                        highlight_color: gameSettings && gameSettings.highlight_color ? gameSettings.highlight_color : "blue",
                        input_mode: gameSettings && gameSettings.input_mode ? gameSettings.input_mode : 0
                    }
                })
            }  else {
                req.session.user = null
                res.delCookie('sudoku21-access-token')
                res.status(400).json({
                    message: "User doesn't exist",
                    class: "authentication",
                    type: 2
                })
            }
        } else {
            req.session.user = null
            res.status(400).json({
                message: 'Cookie not found',
                class: "authentication",
                type: 3
            })
        }
    } catch (error) {
        console.error(error)
        req.session.user = null
        res.delCookie('sudoku21-access-token')
        res.status(500).json({
            message: 'Error, not logged in',
            class: "authentication",
            type: 0
        })
    }
}

module.exports = {
    login,
    logout,
    authenticateSession
}