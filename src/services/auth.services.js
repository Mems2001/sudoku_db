const models = require('../../models')

async function reasignGames (anon_id , user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const games = await models.Games.findAll({
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