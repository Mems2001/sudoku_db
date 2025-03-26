const router = require('express').Router()

const puzzlesControllers = require('../controllers/puzzles.controllers')

router.route('/')
    .get(puzzlesControllers.getAllPuzzles)

router.route('/:puzzle_id')
    .get(puzzlesControllers.getPuzzleById)

module.exports = router