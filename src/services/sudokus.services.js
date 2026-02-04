const models = require('../../models')
const Sudoku1 = require('../../utils/createSudokuP')
const Sudoku2 = require('../../utils/createSudoku2')
const Sudoku3 = require('../../utils/createSudoku3')
const uuid = require('uuid')

async function createSudokuTest (algorithm) {
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
                sudoku = Sudoku3
                break
        }

        const grid = sudoku.generateSudoku()
        let number = ''
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] !== 0) {
                    number += grid[i][j]
                }
            }
        }

        await transaction.commit()
        return {grid, number}
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        throw error
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
    createSudokuTest, 
    findRandomSudoku,
    findAllSudokus,
    findSudokuById
}