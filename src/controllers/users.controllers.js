const usersServices = require('../services/users.services');

async function register (req, res) {
    let errorControl = false
    let user = undefined

    user = await usersServices.findUserByUserName(req.body.username).catch((error) => {console.log(error)})

    if (user) {
        errorControl = true
        res.status(403).json({
            message: "User with this username already exists"
        });
    }

    user = await usersServices.findUserByEmail(req.body.email).catch((error) => {console.log(error)})

    if (user && !errorControl) {
        errorControl = true
        res.status(403).json({
            message: "User with this email already exists"
        });
    }

    if (!user) {
        usersServices.createUser(req.body , req.cookies['access-token'])
         .then((user) => {
            req.session.user = null
            res.clearCookie('access-token' , {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none'
            })
             res.status(201).json(user);
         })
         .catch((error) => {
             console.log(error);
             res.status(400).json({
                 message: "Something went wrong, talk to any administrator"
             });
         });
    }
}

function getAnon(req , res) {
    usersServices.createAnon()
        .then(data => {
            res.cookie('access-token' , data.accesToken , {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                // sameSite: 'none',
                maxAge: 1000*60*60*24 // 1 day
            })
            req.session.user = data.user
            res.status(201).json({message: 'Anon user'})
        })
        .catch(error => {
            res.status(400).json({
                error: error.message
            })
        })
}

 module.exports = {
        register,
        getAnon
    }