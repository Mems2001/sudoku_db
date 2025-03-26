const jwt = require("jsonwebtoken");

const generateJWT = (user_id='' , role_id='' , expiration) => {
    return new Promise((resolve, reject) => {
        const payload = {user_id , role_id}
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: expiration
        }, (err , token) => {
            if (err) {
                console.log(err)
                reject("Couldn't generate the token")
            } else {
                resolve(token)
            }
        })
    })
}

module.exports = {
    generateJWT
}