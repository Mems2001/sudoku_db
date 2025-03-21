const Sudoku = require('../../utils/createSudoku2');

async function createSudoku () {
    const data = new Sudoku();
    data.generateSudoku();
    return data
}

module.exports = {
    createSudoku
}