const usersServices = require('../services/users.services');
const { comparePasswords } = require('../../utils/bcrypt');
const { generateJWT } = require('../../utils/generate-jwt');

async function login (req, res) {
    const {user_name , email , password} = req.body;

    try {
        //User existance verification
        let user = null;
        user = await usersServices.findUserByUserName(user_name);
        if (!user) {
            user = await usersServices.findUserByEmail(email);
        }
        if (!user) {
            return res.status(404).json({
                message: "email or username are not correct"
            });
        }
        //Password validation
        const validatePassword = await comparePasswords(password , user.password);
        if (!validatePassword) {
            return res.status(400).json({
                message: "Wrong password"
            });
        }
        //JWT generation
        const token = await generateJWT(user.id , user.roleId);
        res
        .cookie('access-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1hr
        })
        .status(200).json({
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong, talk to any administrator"
        });
    }
}

function register (req, res) {
   usersServices.createUser(req.body)
    .then((user) => {
        res.status(201).json(user);
    })
    .catch((error) => {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong, talk to any administrator"
        });
    });
}

module.exports = {
    login,
    register
}