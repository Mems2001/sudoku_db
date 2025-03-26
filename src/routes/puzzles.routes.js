const router = require('express').Router()

const puzzlesControllers = require('../controllers/puzzles.controllers')

router.route('/')
    .get(puzzlesControllers.getAllPuzzles)

router.route('/get_random')
    .get(puzzlesControllers.getRandomPuzzle)

router.route('/puzzle/:puzzle_id')
    .get(puzzlesControllers.getPuzzleById)

module.exports = router