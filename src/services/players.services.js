const { Op } = require('sequelize')
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

        const annotations = []
        for (let i = 0; i < 9; i++) {
            let row = []
            for (let j = 0; j < 9; j++) {
                let col = Array(9).fill(0)
                row.push(col)
            }
            annotations.push(row)
        }

        const player = await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id,
            grid: game.Puzzle.grid,
            number: game.Puzzle.number,
            annotations,
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
 * This service is in charge of the principal player's fields updates, such as the grid, status, number or errors, them corresponding to the puzzle solvig progression and status and managing to update all the game players for cooperative games. But also, it allows us to update the status at the related game's table when there is a winner or when the game has failed (all related players failed the game).
 * @param {uuid} game_id - The unique game's table identifier of which the user is a player.
 * @param {uuid} user_id - The unique user's table identifier, which links one user to one player.
 * @param {*} param2 - An object containing the main puzzle solving data, such as grid (array<array<integer>>), status (integer), errors (integer), is_connected (boolean) and gameType (integer).
 * @returns The updated player data.
 */
async function updatePlayerByGameId (game_id , user_id , {grid, number, annotations, status , errors, is_connected, host, game_type}) {
    // console.log('---> data for user updating:' , 'game id:' , game_id, game_type, 'status:', status, grid, number)
    const transaction = await models.sequelize.transaction()
    try {
        let player = await models.Players.findOne({where:{
            user_id,
            game_id
        }})
        // console.log('---> Player to be updated:', player , game_id , user_id)
        let status2 = status
        if (player && status2 === undefined) {
            status2 = player.status
        }
        await player.update({grid , number , annotations, status:status2 , errors, isConnected:is_connected, host} , {transaction})

        //Game finishing conditions (status = 2) are: if any of the connected players had won the game, or, if all the connected players had lost the game.
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }
        })
        const players = await models.Players.findAll({
            where: {
                game_id,
                id: {
                    [Op.ne]: player.id
                }
            }
        })

        // Multiplayer game and other players updating handler
        switch (status2) {
            case 0: //If the current player is still playing
                if (game_type === 2) {
                    for (const p of players) {
                        await p.update({grid, number, errors}, {transaction})
                    }
                }
                break
            case 1: //If the current player won the game.
                await game.update({status:2} , {transaction})
                if (game_type === 2) {
                    for (const p of players) {
                        await p.update({status:1, grid, number, errors} , {transaction})
                    }
                }
                break
            case 2: //If the current player had lost the game.
                if (game_type == 2) {
                    for (const p of players) {
                        await p.update({status:2, grid, number, errors}, {transaction})
                    }
                }
                else if (game_type == 1) {
                    let control = 1
                    for (const p of players) {
                        // console.log(player)
                        if (p.status === 2) control += 1
                    }
                    console.log('players length:', players.length , 'players with status 2:', control)
                    //We declared the game as finished in this case only when all the connected players have lost the game.
                    if (control === players.length) await game.update({status:2} , {transaction})
                }
                else {
                    await game.update({status:2}, {transaction})
                }
                break
        }

        await transaction.commit()
        // console.log(player)
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