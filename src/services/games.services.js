const models = require('../../models')
const uuid = require('uuid')

async function createGame({puzzle_id , sudoku_id} , user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const puzzle = await models.Puzzles.findOne({
            where: {
                id : puzzle_id
            }
        })

        const number = puzzle.number
        const grid = puzzle.grid

        const game = await models.Games.create({
            id: uuid.v4(),
            user_id,
            sudoku_id,
            puzzle_id,
            number,
            grid,
            solved: false
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
        }
    })
}

module.exports = {
    createGame,
    findGameById
}