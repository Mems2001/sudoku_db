const models = require('../../models')
const uuid = require('uuid')

async function createGame({puzzle_id , gameType} , user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const puzzle = await models.Puzzles.findOne({
            where: {
                id : puzzle_id
            }
        })

        const number = puzzle.number
        const grid = puzzle.grid
        let host = false
        if (gameType === 1) {
            host = true
        }

        const game = await models.Games.create({
            id: uuid.v4(),
            type: gameType,
            puzzle_id
        } , {transaction})

        await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id: game.id,
            grid,
            number,
            host
        } , {transaction})

        await transaction.commit()

        return game
    } catch (error) {
        await transaction.rollback()
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
                attributes: ['id', 'type']
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

async function destroyGameById (game_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            }
        })
        await game.destroy({transaction})
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
    destroyGameById
}