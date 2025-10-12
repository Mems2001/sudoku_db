const models = require('../../models')
const uuid = require('uuid')

async function createGame({puzzle_id , gameType, status} , user_id) {
    const transaction = await models.sequelize.transaction()
    console.log('---> user_id <---', user_id)

    try {
        const puzzle = await models.Puzzles.findOne({
            where: {
                id : puzzle_id
            }
        })

        const number = puzzle.number
        const grid = puzzle.grid
        let host = false
        if (gameType != 0) {
            host = true
        }

        const game = await models.Games.create({
            id: uuid.v4(),
            type: gameType,
            puzzle_id,
            status: status || 0
        } , {transaction})

        const annotations = []
        for (let i = 0; i < 9; i++) {
            let row = []
            for (let j = 0; j < 9; j++) {
                let col = Array(9).fill(0)
                row.push(col)
            }
            annotations.push(row)
        }

        await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id: game.id,
            grid,
            number,
            annotations,
            isConnected: true,
            host
        } , {transaction})

        await transaction.commit()

        return game
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        throw error
    }
}

async function  findGameById (game_id) {
    return await models.Games.findOne({
        where: {
            id: game_id
        },
        include: [
            {
                model: models.Puzzles,
                as: 'Puzzle',
                attributes: ['id' , 'number' , 'grid'],
                include: [
                    {
                        model: models.Sudokus,
                        as: 'Sudoku',
                        attributes: ['id' , 'number' , 'grid']
                    }
                ]
            }
        ]
    })
}

async function findSavedGames(user_id) {
    return await models.Players.findAll({
        where: {
            user_id,
            status: 0
        },
        include: [
            {
                model: models.Games,
                as: 'Game',
                attributes: ['id', 'type'],
                include: [
                    {
                        model: models.Puzzles,
                        as: 'Puzzle',
                        attributes: ['id', 'difficulty']
                    }
                ]
            }
        ]
    })
}

async function updateGameById(game_id , {status, time}) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }
        })

        await game.update({
            status,
            time
        } , {transaction})

        await transaction.commit()
        return game
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

/**
 * Destroys the game or the player deppending on the player data. If the game type is not single player and the player is the host, then, it deletes the game and therefore the other players, deletes just the current player otherwise.
 * @param {*} player_id 
 */
async function destroyGameByPlayerId (player_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const player = await models.Players.findOne({
            where: {
                id: player_id
            },
            include: [
                {
                    model: models.Games,
                    as: 'Game',
                    attributes: ['id', 'type']
                }
            ]
        })

        if (player.Game.type !== 0 && player.host) {
            const game = await findGameById(player.game_id)
            await game.destroy({transaction})
        } else {
            await player.destroy({transaction})
        }

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    createGame,
    findGameById,
    findSavedGames,
    updateGameById,
    destroyGameByPlayerId
}