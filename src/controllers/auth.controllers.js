const usersServices = require('../services/users.services')
const models = require('../../models')
const { comparePasswords } = require('../../utils/bcrypt');
const { generateJWT } = require('../../utils/generate-jwt');
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
        //JWT generation
        const accesToken = await generateJWT(user.id , user.role_id , '1d');
        const refreshToken = await generateJWT(user.id , user.role_id , '7 d');
        res.cookie('access-token', accesToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000*60*60*24 // 1 day
            })
        // res.cookie('refresh-token' , refreshToken , {
        //     httpOnly: true,
        //         secure: process.env.NODE_ENV === 'production',
        //         sameSite: 'strict',
        //         maxAge: 1000*60*60*24*7 // 7 days
        // })
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
    res.clearCookie('access-token')
    res.status(200).json({
        message: "User logged out"
    })
}

async function authenticateSession (req ,res) {
    const cookie = req.cookies['access-token']
    
    try {
        if (cookie) {
            const data = verify(cookie , process.env.JWT_SECRET)
            if (!data) {
                res.status(400).json({
                    message: 'Not logged in'
                })
            }
            const role = await models.Roles.findOne({
                where: {
                    id: data.role_id
                }
            })
    
            if (role) {
                res.status(200).json({
                    message: "Session authenticated",
                    role: role.name
                })
            }  else {
                res.status(400).json({
                    message: 'Not logged in'
                })
            }
        } else {
            res.status(400).json({
                message: 'Not logged in'
            })
        }
    } catch (error) {
        res.clearCookie('access-token')
        res.status(400).json({
            message: 'Expired token'
        })
    }
}

module.exports = {
    login,
    logout,
    authenticateSession
}