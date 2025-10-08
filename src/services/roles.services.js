const models = require('../../models')

async function findRoleById(role_id) {
    const response = await models.Roles.findOne({
        where: {
            id: role_id
        }
    })

    return response
}

module.exports = {
    findRoleById
}