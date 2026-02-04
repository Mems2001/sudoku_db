const puzzlesServices = require('../services/puzzles.services')

function getAllPuzzles(req , res) {
    puzzlesServices.findAllPuzzles()
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getPuzzleById(req , res) {
    puzzlesServices.findPuzzleBySudokuId(req.params.puzzle_id)
        .then(data =>{
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getPuzzleTest (req, res) {
    puzzlesServices.createPuzzleTest(req.body.sudoku, req.body.difficulty, req.params.algorithm)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                err
            })
        })
}

function getRandomPuzzle (req , res) {
    puzzlesServices.findRandomPuzzle(req.params.difficulty)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

module.exports = {
    getAllPuzzles,
    getPuzzleTest,
    getPuzzleById,
    getRandomPuzzle
}