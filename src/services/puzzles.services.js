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

module.exports = {
    findAllPuzzles,
    findPuzzleBySudokuId
}