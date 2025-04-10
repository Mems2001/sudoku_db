const models = require('../../models')
const uuid = require('uuid')

async function createMultiplayerGame ({puzzle_id , sudoku_id} , user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const puzzle = await models.Puzzles.findOne({where: {id: puzzle_id}})
        const game = await models.MultiplayerGames.create({
            id: uuid.v4(),
            puzzle_id,
            sudoku_id,
            grid: puzzle.grid,
            number: puzzle.number
        } , {transaction})

        const player = await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id: game.id,
            grid: puzzle.grid,
            number: puzzle.number,
            host: true
        } , {transaction})

        await transaction.commit()
        return {game , player}
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

async function updateMultiplayerGame (game_id , {status , time}) {
    const transaction = await models.sequelize.transaction()
    // console.log ('game time:' , time)
    try {
        const game = await models.MultiplayerGames.findOne({
            where: {
                id: game_id
            }
        })
        const updatedGame = await game.update({
            status,
            time
        })

        return updatedGame
    } catch (err) {
        await transaction.rollback()
        throw err
    }
}

module.exports = {
    createMultiplayerGame,
    findMultiplayerGameById,
    updateMultiplayerGame
}