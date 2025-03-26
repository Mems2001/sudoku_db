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

function getRandomPuzzle (req , res) {
    puzzlesServices.findRandomPuzzle()
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
    getPuzzleById,
    getRandomPuzzle
}