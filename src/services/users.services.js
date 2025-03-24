const models = require('../../models');

function findUserByUserName (username) {
    return models.Users.findOne({
        where: {
            username
        }
    })
}

module.exports = {
    findUserByUserName
}