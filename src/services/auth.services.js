const models = require('../../models')

/**
 * Whenever a user is trying to log in, but previously he was using an anon user profile, the players tables related to it need to be reasigned to its non anon user profile.
 * @param {*} anon_id 
 * @param {*} user_id 
 */
async function reasignGames (anon_id , user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const games = await models.Players.findAll({
            where: {
                user_id: anon_id
            }
        })
        if (games.length > 0) {
            for (let game of games) {
                await game.update({
                    user_id
                } , {transaction})
            }
        }
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    reasignGames
}