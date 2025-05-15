const sudokuControlles = require('../controllers/sudokus.controllers');
const { authenticateSession } = require('../middlewares/session.middleware')

const router = require('express').Router();

router.route('/')
    .get(sudokuControlles.getAllSudokus)

router.route('/get_random')
    .get(authenticateSession , sudokuControlles.getRandomSudoku)
        
router.route('/:id')
    .get(sudokuControlles.getSudokuById)

router.route('/create')
    .post(sudokuControlles.produceSudoku)

module.exports = router