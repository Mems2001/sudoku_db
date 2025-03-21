const models = require('../../models');
const Sudoku = require('../../utils/createSudoku2');

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

module.exports = {
    createSudoku
}