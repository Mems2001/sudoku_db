const models = require('../../models')
const uuid = require('uuid')

async function createPlayerByUserId (user_id, game_id, {is_connected}) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.Games.findOne({where: {id: game_id},
        include: [
            {
                model: models.Puzzles,
                as: 'Puzzle',
                attributes: ['grid' , 'number']
            }
        ]
        })

        const player = await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id,
            grid: game.Puzzle.grid,
            number: game.Puzzle.number,
            isConnected: is_connected
        } , {transaction})

        await transaction.commit()
        return player
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function findPlayerByUserId (user_id) {
    return await models.Players.findOne({
        where: {
            user_id
        }
    })
}

async function findPlayerByUserIdGameId (user_id, game_id) {
    return await models.Players.findOne({
        where: {
            user_id,
            game_id
        }
    })
}

async function findPlayerByGameId (game_id , user_id) {
    // console.log('---> params in findPlayerByGameId:' , game_id , user_id)
    return await models.Players.findOne({
        where: {
            game_id,
            user_id
        },
        include: [
            {
                model: models.Games,
                as: 'Game',
                attributes: ['status' , 'time' , 'time'],
                include: [
                    {
                        model: models.Puzzles,
                        as: 'Puzzle',
                        attributes: ['grid' , 'number'],
                        include: [
                            {
                                model: models.Sudokus,
                                as: 'Sudoku',
                                attributes: ['grid' , 'number']
                            }
                        ]
                    }
                ]
            }
        ]
    })
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

async function findConnectedPlayersByGameId (game_id) {
    return await models.Players.findAll({
        where: {
            game_id,
            isConnected: true
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

async function verifyUserOnPlayerList (game_id , user_id) {
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
        console.log('---> ids comparisson:', 'player in list:', player.user_id , 'user:', user_id)
        if (player.user_id === user_id) control = true
    });

    return control
}
/**
 * This service is in charge of the principal player's fields updates, such as the grid, status, number or errors, them corresponding to the puzzle solvig progression and status. But also, it allows us to update the status at the relating game's table when there is a winner or when the game has failed (all related players failed the game).
 * @param {*} game_id - The unique game's table identifier of which the user is a player.
 * @param {*} user_id - The unique user's table identifier, which links one user to one player.
 * @param {*} param2 - An object containing the main puzzle solving data, such as grid (array<array<integer>>), status (integer), errors (integer), is_connected (boolean) and gameType (integer).
 * @returns The updated player data.
 */
async function updatePlayerByGameId (game_id , user_id , {grid, number, status , errors, is_connected, host}) {
    console.log('---> data for user updating:' , 'game id:' , game_id)
    const transaction = await models.sequelize.transaction()
    try {
        let player = await models.Players.findOne({where:{
            user_id,
            game_id
        }})
        // console.log(player , game_id , user_id)
        if (player) {
            let status2 = status
            if (status2 === undefined) status2 = player.status
            await player.update({grid , number , status , errors, isConnected:is_connected, host} , {transaction})
        }

        //Game finishing conditions (status = 2) are: if any of the connected players had won the game, or, if all the connected players had lost the game.
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }
        })
        const players = await models.Players.findAll({
            where: {
                game_id,
                isConnected: true
            }
        })

        switch (status) {
            case 0: //If the current player is still playing
                break
            case 1: //If the current player won the game.
                await game.update({status:2} , {transaction})
                break
            case 2: //If the current player lost the game.
                let control = 1
                for (const player of players) {
                    // console.log(player)
                    if (player.status === 2) control += 1
                }
                console.log('players length:', players.length , 'players with status 2:', control)
                //We declared the game as finished in this case only when all the connected players have lost the game.
                if (control === players.length) await game.update({status:2} , {transaction})
                break
        }

        await transaction.commit()
        return player
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        throw error
    }
}

async function destroyPlayerByUserIdGameId (user_id , game_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const player = await models.Players.findOne({where: {user_id , game_id}})
        if (player) await player.destroy({transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    createPlayerByUserId,
    findPlayerByUserId,
    findPlayerByUserIdGameId,
    findPlayerByGameId,
    findPlayersByGameId,
    findConnectedPlayersByGameId,
    verifyUserOnPlayerList,
    updatePlayerByGameId,
    destroyPlayerByUserIdGameId
}