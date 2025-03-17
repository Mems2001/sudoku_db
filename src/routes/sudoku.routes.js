const sudokuControlles = require('../controllers/sudoku.controllers');

const router = require('express').Router();

router.route('/create')
    .post(sudokuControlles.produceSudoku)

module.exports = router