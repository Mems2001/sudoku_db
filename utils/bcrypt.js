const bcrypt = require("bcrypt");

const hashPassword = (password) => {
    return bcrypt.hashSync(password , 10)
}

const comparePasswords = (plainPass , hashedPass) => {
    return bcrypt.compare(plainPass , hashedPass)
}

module.exports = {
    hashPassword , 
    comparePasswords
}