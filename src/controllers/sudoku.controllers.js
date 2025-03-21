const sudokuServices = require('../services/sudoku.services');

function produceSudoku (req , res) {
    sudokuServices.createSudoku()
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                err
            })
        })
}

function getRandomSudoku (req , res) {
    sudokuServices.findRandomSudoku()
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                err
            })
        })
}

module.exports = {
    produceSudoku,
    getRandomSudoku
}