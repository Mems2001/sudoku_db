const usersServices = require('../services/users.services')
const authServices = require('../services/auth.services')
const models = require('../../models')
const { comparePasswords } = require('../../utils/bcrypt')
const { generateJWT } = require('../../utils/generate-jwt')
const {verify} = require('jsonwebtoken')

/**
 * The login process first checks if the user exists. Then, verifies the password. But then it runs the anon verification process. Which is code that identifies if the user that's trying to log in was using an anon user. If so, it transfers all the games played as anon to the user profile and finally deletes the anon user. Only then it sets the jwt 'access-token' cookie.
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
        //User existance verification
        let user = null;
        if (useUsername) {
            user = await usersServices.findUserByUserName(username);
            if (!user) {
                return res.status(404).json({
                    message: "username not found",
                    type: 1
                });
            }
        } else {
            user = await usersServices.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    message: "email not found",
                    type: 1
                });
            }
        }
        //Password validation
        const validatePassword = await comparePasswords(password , user.password);
        if (!validatePassword) {
            return res.status(400).json({
                message: "wrong password",
                type: 2
            });
        }
        // Anon verification
        const cookie = req.cookies['access-token']
        if (cookie) {
            const data = verify(cookie , process.env.JWT_SECRET)
            authServices.reasignGames(data.user_id , user.id)
                .then(() => {
                    console.log('Games reassigned')
                    usersServices.deleteUser(data.user_id)
                    req.session.user = null
                    // Clear cookie here is an option but performance negtive
                })
        }
        //JWT generation
        const accesToken = await generateJWT(user.id , user.role_id , '1d');
        // const refreshToken = await generateJWT(user.id , user.role_id , '7 d');
        res.setCookie('access-token', accesToken)
        // res.cookie('refresh-token' , refreshToken)
        res.status(200).json({
                message: "user logged in"
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong, talk to any administrator"
        });
    }
}

function logout (req , res) {
    req.session.user = null
    res.delCookie('access-token')
    res.status(200).json({
        message: "User logged out"
    })
}

/**
 * This function is in charge of verify is the user session is valid, using an "access-token" cookie. IF so, ir returns his id, role, and game settings
 * @return If the authentication succeeds, it returns the user's id and role. Otherwise it deletes the cookie if it exists.
 */
async function authenticateSession (req ,res) {
    const cookie = req.cookies['access-token']
    console.log(cookie)
    
    try {
        if (cookie) {
            const data = verify(cookie , process.env.JWT_SECRET)
            if (!data) {
                req.session.user = null
                res.status(400).json({
                    message: 'Session expired'
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
            const gameSettings = await models.GameSettings.findOne({
                where: {
                    user_id: data.user_id
                }
            })

            if (role && user) {
                req.session.user = user
                res.status(200).json({
                    message: "Session authenticated",
                    user_id: user.id,
                    role: role.name,
                    settings: {
                        cells_highlight: gameSettings.cells_highlight,
                        numbers_highlight: gameSettings.numbers_highlight
                    }
                })
            }  else {
                req.session.user = null
                res.delCookie('access-token')
                res.status(400).json({
                    message: "User doesn't exist"
                })
            }
        } else {
            req.session.user = null
            res.status(400).json({
                message: 'Cookie not found'
            })
        }
    } catch (error) {
        console.error(error)
        req.session.user = null
        res.delCookie('access-token')
        res.status(400).json({
            message: 'Error, not logged in'
        })
    }
}

module.exports = {
    login,
    logout,
    authenticateSession
}