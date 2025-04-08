const { where } = require('sequelize')
const models = require('../../models')
const uuid = require('uuid')

async function createMultiplayerGame ({puzzle_id , sudoku_id}) {
    const transaction = await models.sequelize.transaction()

    try {
        const puzzle = await models.Puzzles.findOne({where: {id: puzzle_id}})
        const data = await models.MultiplayerGames.create({
            id: uuid.v4(),
            puzzle_id,
            sudoku_id,
            grid: puzzle.grid,
            number: puzzle.number
        } , {transaction})

        await transaction.commit()
        return data
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function findMultiplayerGameById (id) {
    return await models.MultiplayerGames.findOne({
        where: {id},
        include: [
            {
                model: models.Sudokus,
                as: 'Sudoku',
                attributes: ['id' , 'number' , 'grid']
            },
            {
                model: models.Puzzles,
                as: 'Puzzle',
                attributes: ['id' , 'number' , 'grid']
            }
        ]
    })
}

module.exports = {
    createMultiplayerGame,
    findMultiplayerGameById
}