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
        const anon_profile = await models.Profiles.findOne({
            where: {
                user_id: anon_id
            }
        })
        const profile = await models.Profiles.findOne({
            where: {
                user_id
            }
        })
        const game_stats = profile.game_stats
        const anon_game_stats = anon_profile.game_stats
        let new_game_stats = {...game_stats}

        for (const key of Object.keys(anon_game_stats)) {
            // console.log(key)
            if (game_stats[key]) {
                for (const key2 of Object.keys(anon_game_stats[key])) {
                    // console.log(key2)
                    if (game_stats[key][key2]) new_game_stats[key] = {...new_game_stats[key], [key2] : game_stats[key][key2] + anon_game_stats[key][key2]}
                    else new_game_stats[key] = {...new_game_stats[key], [key2] : anon_game_stats[key][key2]}
                }
            } else {
                new_game_stats[key] = anon_game_stats[key]
            }
        }
        console.log(new_game_stats)
        await profile.update({game_stats: new_game_stats}, {transaction})

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