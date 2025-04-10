const usersServices = require('../services/users.services')
const authServices = require('../services/auth.services')
const models = require('../../models')
const { comparePasswords } = require('../../utils/bcrypt')
const { generateJWT } = require('../../utils/generate-jwt')
const {verify} = require('jsonwebtoken')

async function login (req, res) {
    const {useUsername , username , email , password} = req.body

    try {
        //User existance verification
        let user = null;
        if (useUsername) {
            user = await usersServices.findUserByUserName(username);
            if (!user) {
                return res.status(404).json({
                    message: "username not found"
                });
            }
        } else {
            user = await usersServices.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({
                    message: "email not found"
                });
            }
        }
        //Password validation
        const validatePassword = await comparePasswords(password , user.password);
        if (!validatePassword) {
            return res.status(400).json({
                message: "Wrong password"
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
                .catch(error => console.error({error}))
        }
        //JWT generation
        const accesToken = await generateJWT(user.id , user.role_id , '1d');
        // const refreshToken = await generateJWT(user.id , user.role_id , '7 d');
        res.setCookie('access-token', accesToken)
        // res.cookie('refresh-token' , refreshToken)
        res.status(200).json({
                message: "User logged in"
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
    
            if (role && user) {
                req.session.user = user
                res.status(200).json({
                    message: "Session authenticated",
                    role: role.name
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