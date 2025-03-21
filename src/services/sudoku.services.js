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
        const data = await models.Sudokus.create({
            id: uuid.v4(),
            number,
            grid
        }, {transaction});

        await transaction.commit();
        return data;
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        throw error;
    }
}

async function findRandomSudoku () {
    const data = await models.Sudokus.findOne({
        order: models.sequelize.random()
    });
    return data;
}

module.exports = {
    createSudoku, 
    findRandomSudoku
}