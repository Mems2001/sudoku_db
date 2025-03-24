const sudokuServices = require('../services/sudokus.services');

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

function getAllSudokus (req , res) {
    sudokuServices.findAllSudokus()
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                err
            })
        })
}

function getSudokuById (req , res) {
    const { id } = req.params;
    sudokuServices.findSudokuById(id)
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
    getRandomSudoku,
    getAllSudokus,
    getSudokuById
}