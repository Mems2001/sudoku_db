const sudokuControlles = require('../controllers/sudoku.controllers');

const router = require('express').Router();

router.route('/')
    .get(sudokuControlles.getAllSudokus)

router.route('/get_random')
        .get(sudokuControlles.getRandomSudoku)
        
router.route('/:id')
    .get(sudokuControlles.getSudokuById)

router.route('/create')
    .post(sudokuControlles.produceSudoku)

module.exports = router