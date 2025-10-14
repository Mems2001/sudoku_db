const models = require('../../models')
const uuid = require('uuid')
const profilesServices = require('./profiles.services')

/**
 * The function creates the game row to store time, game status and type for all game types. This is usefull for multiplayer data specially, which contains data shared between all the playes as the time or game status. Single player games share this structure anyways with no further issues. This function will always be called by the user who first starts a game, so, for multiplayer games it implies creating a new player row with the host value as true. Also, for game stats we count the game only if it as a single player game, because a multiplayer game is not set as started until the host agree to continue at the VsRoom UI but the single player game is set as started since the creation of the game.
 * @param {*} body
 * @param {*} user_id 
 * @returns 
 */
async function createGame({puzzle_id , gameType, status} , user_id) {
    const transaction = await models.sequelize.transaction()
    // console.log('---> user_id <---', user_id)

    try {
        const puzzle = await models.Puzzles.findOne({
            where: {
                id : puzzle_id
            }
        })

        const number = puzzle.number
        const grid = puzzle.grid
        const difficulty = puzzle.difficulty
        
        let host = false
        // For multiplayer games we make the current player the host.
        if (gameType != 0) {
            host = true
        }

        // For single player games we update it game stats
        const games_started_by_difficulty = profilesServices.handleGameStatByDifficulty(difficulty, 'started')
        console.log(games_started_by_difficulty)

        if (gameType === 0) {
            const profile = await models.Profiles.findOne({
                where: {
                    user_id
                }
            })
            const game_stats = profile.game_stats
            let single_player = game_stats.single_player ?? {}
            single_player = {
                ...single_player,
                [games_started_by_difficulty]: single_player[games_started_by_difficulty] ? single_player[games_started_by_difficulty] + 1 : 1
            }
            const new_game_stats = {
                ...game_stats,
                single_player
            }

            await profile.update({game_stats: new_game_stats}, {transaction})
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

async function updateGameById(game_id, {status, time}) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            },
            include: [
                {
                    model: models.Puzzles,
                    as: "Puzzle",
                    attributes: {
                        include: ['difficulty']
                    }
                }
            ]
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

async function startMultiplayerGame(game_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }, 
            include: [
                {
                    model: models.Puzzles,
                    as: 'Puzzle',
                    attributes: ['difficulty']
                }
            ]
        })

        await game.update({status:1}, {transaction})

        if (game.type !== 0) {
            const players = await models.Players.findAll({
                where:
                {
                    game_id
                }})
            for (const player of players) {
                const profile = await models.Profiles.findOne({
                    where: {
                        user_id: player.user_id
                    }
                })
                const game_type_name = profilesServices.handleGameStatByGameType(game.type)
                const games_started_by_difficulty = profilesServices.handleGameStatByDifficulty(game.Puzzle.difficulty, 'started')
                const game_stats = profile.game_stats
                const game_stats_by_game_type = game_stats[game_type_name] ?? {}
                let new_game_stats_by_game_type = {
                   ...game_stats_by_game_type,
                   [games_started_by_difficulty]: game_stats_by_game_type[games_started_by_difficulty] ? game_stats_by_game_type[games_started_by_difficulty] + 1 : 1
                }
                let new_game_stats = {
                    ...profile.game_stats,
                    [game_type_name]: new_game_stats_by_game_type
                }
                
                await profile.update({game_stats: new_game_stats}, {transaction})
            }
        }

        await transaction.commit()
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

        if ((player.Game.type !== 0 && player.host) || player.Game.type === 0) {
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

async function destroyGameById(game_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }
        })
        await game.destroy({transaction})

        await transaction.commit()
    } catch(error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    createGame,
    findGameById,
    findSavedGames,
    updateGameById,
    destroyGameById,
    startMultiplayerGame,
    destroyGameByPlayerId
}