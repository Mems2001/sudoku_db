const usersServices = require('../services/users.services');

async function register (req, res) {
    let errorControl = false
    let user = undefined

    user = await usersServices.findUserByUserName(req.body.username).catch((error) => {console.log(error)})

    if (user) {
        errorControl = true
        res.status(403).json({
            message: "user with this username already exists"
        });
    }

    user = await usersServices.findUserByEmail(req.body.email).catch((error) => {console.log(error)})

    if (user && !errorControl) {
        errorControl = true
        res.status(403).json({
            message: "user with this email already exists"
        });
    }

    if (!user) {
        usersServices.createUser(req.body , req.cookies['access-token'])
         .then((user) => {
            req.session.user = null
            res.delCookie('access-token')
             res.status(201).json(user);
         })
         .catch((error) => {
             console.log(error);
             res.status(400).json({
                 message: "something went wrong, talk to any administrator"
             });
         });
    }
}

function getAnon(req , res) {
    usersServices.createAnon()
        .then(data => {
            res.setCookie('access-token' , data.accesToken)
            req.session.user = data.user
            res.status(201).json(data.user)
        })
        .catch(error => {
            res.status(400).json({
                error: error.message
            })
        })
}

function patchGameSettings(req , res) {
    usersServices.updateGameSettingsByUserId(req.body, req.session.user.user_id)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(error => {
            res.status(400).json({
                error: error.message
            })
        })
}

 module.exports = {
        register,
        getAnon,
        patchGameSettings
    }