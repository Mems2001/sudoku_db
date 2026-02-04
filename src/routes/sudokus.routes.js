const sudokuControllers = require('../controllers/sudokus.controllers');
const { authenticateSession } = require('../middlewares/session.middleware')

const router = require('express').Router();

router.route('/')
    .get(sudokuControllers.getAllSudokus)

router.route('/get_random')
    .get(authenticateSession , sudokuControllers.getRandomSudoku)
        
router.route('/:id')
    .get(sudokuControllers.getSudokuById)

router.route('/test/:algorithm')
    .get(sudokuControllers.getSudokuTest)

module.exports = router