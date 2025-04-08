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
            grid
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

async function findSavedGames(user_id) {
    return await models.Games.findAll({
        where: {
            user_id,
            status: 0
        }
    })
}

async function updateGameById(game_id , {grid , status , errors , time}) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.Games.findOne({
            where: {
                id: game_id
            },
            include: [
                {
                    model: models.Sudokus,
                    as: 'Sudoku',
                    attributes: ['id' , 'number' , 'grid']
                }
            ]
        })

        let number = game.number
        if (grid) {
            number = ''
            for (let i=0 ; i < 9 ; i++) {
                for (let j=0 ; j<9 ; j++) {
                    number += String(grid[i][j])
                }
            }
        }

        // console.log(grid , number)

        await game.update({
            grid,
            number,
            status,
            errors,
            time
        } , {transaction})

        await transaction.commit()
        return game
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    createGame,
    findGameById,
    findSavedGames,
    updateGameById
}