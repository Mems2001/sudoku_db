const sudokuServices = require('../services/sudoku.services');

function produceSudoku (req , res) {
    sudokuServices.createSudoku()
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

module.exports = {
    produceSudoku
}