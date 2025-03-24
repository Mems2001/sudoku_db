const jwt = require("jsonwebtoken");

const generateJWT = (uid='' , roleId='') => {
    return new Promise((resolve, reject) => {
        const payload = {uid , roleId}
        jwt.sign(payload, process.env.JWT_SECRET, {
            // expiresIn: "24h"
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