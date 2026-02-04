const router = require('express').Router()

const puzzlesControllers = require('../controllers/puzzles.controllers')

router.route('/')
    .get(puzzlesControllers.getAllPuzzles)

router.route('/get_random/:difficulty')
    .get(puzzlesControllers.getRandomPuzzle)

router.route('/puzzle/:puzzle_id')
    .get(puzzlesControllers.getPuzzleById)

router.route('/test/:algorithm')
    .post(puzzlesControllers.getPuzzleTest)

module.exports = router