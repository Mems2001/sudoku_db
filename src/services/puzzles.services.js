const models = require('../../models')
const PuzzleGenerator = require('../../utils/createSudokuPuzzle')

async function findAllPuzzles() {
    return await models.Puzzles.findAndCountAll()
} 

async function findPuzzleBySudokuId(sudoku_id) {
    return await models.Puzzles.findOne({
        where: {
            sudoku_id
        }
    })
}

async function createPuzzleTest (grid, difficulty) {
    const transaction = await models.sequelize.transaction()

    try {      
        // console.log('---> Creating puzzle', JSON.stringify(grid), difficulty)
        const puzzle = PuzzleGenerator.removeNumbers(grid, difficulty)
        await transaction.commit()
        return puzzle
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        throw error
    }
}

async function findRandomPuzzle (difficulty) {
    try {
        const data = await models.Puzzles.findOne({
            where: {
                difficulty
            },
            order: models.sequelize.random()
        });
        if (!data) {
            throw new Error('No Sudoku puzzles found in the database.');
        }
        return data
    } catch (error) {
        console.error('Error finding random Puzzle:', error);
        throw error;
    }
}

module.exports = {
    findAllPuzzles,
    createPuzzleTest,
    findPuzzleBySudokuId,
    findRandomPuzzle
}