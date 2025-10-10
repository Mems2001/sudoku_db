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
        usersServices.createUser(req.body , req.cookies['sudoku21-access-token'])
         .then((user) => {
            req.session.user = null
            res.delCookie('sudoku21-access-token')
            res.status(201).json(user)
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
    usersServices.returnAnon(req.body)
        .then(data => {
            res.setCookie('sudoku21-access-token' , data.accesToken)
            req.session.user = data.user
            res.status(201).json({
                message: "Anon user logged in",
                user_id: data.user.id,
                role: "anon"
            })
        })
        .catch(error => {
            // console.error(error)
            res.status(500).json({
                message: error.message,
                class: "getAnon",
                type: 0
            })
        })
}

function patchGameSettings(req , res) {
    console.log(req.body)
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