const Sudoku = require('../../utils/createSudoku');

async function createSudoku () {
    const data = new Sudoku();
    data.sudokuStructure();
    data.createSudoku();
    return data
}

module.exports = {
    createSudoku
}