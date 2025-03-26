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
}

 module.exports = {
        register
    }