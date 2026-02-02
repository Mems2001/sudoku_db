const sudokuServices = require('../services/sudokus.services');

function getSudokuTest (req , res) {
    sudokuServices.createSudokuTest(req.params.algorithm)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                err
            })
        })
}

function getPuzzleTest (req, res) {
    sudokuServices.createPuzzleTest(req.body.sudoku, req.body.difficulty, req.params.algorithm)
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
    getSudokuTest,
    getPuzzleTest,
    getRandomSudoku,
    getAllSudokus,
    getSudokuById
}