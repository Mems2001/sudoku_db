'use strict';
const uuid = require('uuid')
const Sudoku = require('../utils/createSudoku3');
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const transaction = await queryInterface.sequelize.transaction()

    try {
      // We'll create 100 sudokus and puzzles for testing
      let sudokus = []
      let puzzles = []
      for (let i=0 ; i < 100 ; i++) {
        const sudoku = new Sudoku()
        const grid = sudoku.generateSudoku()
        let number = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] !== 0) {
                    number += String(grid[i][j]);
                }
            }
        }
        const sudokuE = {
          id: uuid.v4(),
          number,
          grid: JSON.stringify(grid),
          created_at: new Date(),
          updated_at: new Date()
        }
        sudokus.push(sudokuE)

        const puzzle = sudoku.removeNumbers(sudoku.grid , 40)
        let puzzle_number = ''
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
              if (puzzle[i][j] !== 0) {
                  puzzle_number += String(puzzle[i][j]);
              } else {
                  puzzle_number += '0'
              }
          }
        }
        puzzles.push({
          id: uuid.v4(),
          sudoku_id: sudokuE.id,
          number: puzzle_number,
          grid: JSON.stringify(puzzle),
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      // console.log(sudokus)

      await queryInterface.bulkInsert('sudokus' , sudokus , {transaction})
      await queryInterface.bulkInsert('puzzles' , puzzles , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const transaction = await queryInterface.sequelize.transaction()

    try {
      
      await queryInterface.bulkDelete('sudokus' , {
        id: {
          [Op.ne] : ''
        }
      } , {transaction})

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
};
