const models = require('../../models')
const Sudoku1 = require('../../utils/createSudokuP')
const Sudoku2 = require('../../utils/createSudoku2')
const Sudoku3 = require('../../utils/createSudoku3')

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

async function createPuzzleTest (grid, difficulty, algorithm) {
    const transaction = await models.sequelize.transaction()

    try {
        let sudoku
        switch(algorithm) {
            case '1':
                sudoku = new Sudoku1()
                break
            case '2':
                sudoku = new Sudoku2()
                break
            case '3':
                sudoku = new Sudoku3()
                break
        }
        
        // console.log('---> Creating puzzle', grid, difficulty, algorithm)
        const puzzle = sudoku.removeNumbers(grid, (difficulty + 1)*10)
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