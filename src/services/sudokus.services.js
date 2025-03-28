const models = require('../../models');
const Sudoku = require('../../utils/createSudoku2');
const uuid = require('uuid');

async function createSudoku () {
    const transaction = await models.sequelize.transaction();

    try {
        const sudoku = new Sudoku();
        const grid = sudoku.generateSudoku();
        let number = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] !== 0) {
                    number += grid[i][j];
                }
            }
        }
        let data = await models.Sudokus.create({
            id: uuid.v4(),
            number,
            grid: JSON.stringify(grid)
        }, {transaction});

        const puzzle = sudoku.removeNumbers(sudoku.grid , 40)
        let puzzleNumber = ''

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (puzzle[i][j] !== 0) {
                    puzzleNumber += puzzle[i][j];
                } else {
                    puzzleNumber += '0'
                }
            }
        }

        let puzzleData = await models.Puzzles.create({
            id: uuid.v4(),
            sudoku_id: data.id,
            number: puzzleNumber,
            grid: puzzle
        } , {transaction})

        if (!data && !puzzleData) {
            data = createSudoku()
        }

        await transaction.commit();
        return {data , puzzleData};
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        throw error;
    }
}

async function findRandomSudoku () {
    try {
        const data = await models.Sudokus.findOne({
            order: models.sequelize.random()
        });
        if (!data) {
            throw new Error('No Sudoku puzzles found in the database.');
        }
        return data
    } catch (error) {
        console.error('Error finding random Sudoku:', error);
        throw error;
    }
}

async function findAllSudokus () {
    const data = await models.Sudokus.findAndCountAll();
    return data
}

async function findSudokuById (id) {
    const data = await models.Sudokus.findOne({
        where: {
            id
        }
    });
    return data
}

module.exports = {
    createSudoku, 
    findRandomSudoku,
    findAllSudokus,
    findSudokuById
}