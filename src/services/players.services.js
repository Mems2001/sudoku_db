const models = require('../../models')
const uuid = require('uuid')

async function createPlayerByUserId (user_id , game_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.MultiplayerGames.findOne({where: {id: game_id}})

        const player = await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id,
            grid: game.grid,
            number: game.number
        } , {transaction})

        await transaction.commit()
        return player
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function findPlayersByGameId (game_id) {
    return await models.Players.findAll({
        where: {
            game_id
        },
        include: [
            {
                model: models.Users,
                as: 'User',
                attributes: ['username']
            }
        ]
    })
}

async function verifyUserInPlayerList (game_id , user_id) {
    const playersList = await models.Players.findAll({
        where: {
            game_id
        },
        include: [
            {
                model: models.Users,
                as: 'User',
                attributes: ['id']
            }
        ]
    })

    let control = false
    playersList.forEach(player => {
        if (player.user_id === user_id) control = true
    });

    return control
}

module.exports = {
    createPlayerByUserId,
    findPlayersByGameId,
    verifyUserInPlayerList
}