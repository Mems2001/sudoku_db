const models = require('../../models')

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
    findPuzzleBySudokuId,
    findRandomPuzzle
}