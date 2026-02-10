const { json } = require("body-parser")
const DifficultyHandler = require('./difficultyHandler')
const Utils = require('./sudokuUtils')
const SudokuUtils = require("./sudokuUtils")

class Sudoku {
    #posibilities_grid
    grid

    constructor () {
        this.grid = this.#generateEmptyGrid()
        this.#posibilities_grid = this.#generatePosibilitiesGrid()
    }

    #generateEmptyGrid() {
        const grid = Array.from({ length: 9 }, () => Array(9).fill(0))
        return grid
    }

    /** This function creates an array of arrays, which ultimate element is another array that contains all the numbers that are safe to place at the grid location. For the later, it shares structure with the sudoku grid, the first set of arrays represents rows and each element inside it represent a column. So grid[row][column] will gives us the array of posible numbers at the selected row and selected column. 
     * @returns The array of arrays, which elements are an array of posible numbers to be set at that location.
    */
    #generatePosibilitiesGrid() {
         const grid = [];
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                row.push([1,2,3,4,5,6,7,8,9]); // new array for each cell
            }
            grid.push(row);
        }
        return grid
    }

    /**
     * This recursive and backtracking function is in charge of producing a fully solved sudoku. It receives an empty or partially empty grid and utterly sets a fully solved grid at the class prop.
     * @param {*} grid A sudoku grid.
     * @returns A boolean, true if the grid is solved and false otherwise. This values enhances and allows the recursive behaviour.
     */
    #solveSudoku(grid, posibilities) {
        const cell = Utils.findNextCellToTry(grid, posibilities)
        if (cell === null) return true
        if (cell.deadEnd) return false
        const { row, col } = cell

        // console.log('---> At:', row, col)
        // We shuffle the array of posible numbers to guarantee randomness at each cell.
        const shuffled_array = SudokuUtils.shuffleArray([...posibilities[row][col]])
        // console.log(shuffled_array)
        if (shuffled_array.length <= 0) return false

        // We try each posible number. For each, we call the solveSudoku function again to tell if the sudoku is solvable given the number we are tying. If solvable, we keep the number, if not we try the next number. When we are at a dead end the array of posible numbers will be empty, this is, the sudoku is not solvable, then we back-track. We back-track as well when any number of the array of posible numbers at the location leads us to a dead end. This means, we return to the previous location iteration, dicard the already tried number and keep trying with the other numbers. For example, suppose we are trying with number 5 at the [5][7] location. We will then fill the grid with 5 at [5][7] and then proceed to try the posible numbers at [5][8] (call again the solveSudoku function with the partially filled grid with 5 at [5][7]). If at the later location we found an empty array of posible numbers the algorithm returns to [5][7], discards 5 and try another number. If any of the numbers of the array of posible numbers at [5][7] leads us to a solution, then we return to [5][6] and try another number and so on, and iterate like that till we find a solvable path.
        for (const number of shuffled_array) {
            if (!Utils.asignNumber(posibilities, number, row, col, this.grid)) continue

            const updated_possibilities = Utils.removeFromPossibilities(posibilities, number, row, col)
            if (this.#solveSudoku(grid, updated_possibilities.possibilities_grid)) {
                return true
            }
            // console.log('---> number do not fit:', number, row, col)
            this.grid = Utils.removeNumber(row, col, this.grid)
            Utils.revertPossibilities(posibilities, updated_possibilities.changes)
        }

        return false
    }
 
    static generateSudoku() {
        const auxInstance = new Sudoku()
        auxInstance.#solveSudoku(auxInstance.grid, auxInstance.#posibilities_grid)

        return auxInstance.grid
    }

}

// const test = new Sudoku()
// test.generateSudoku()
// const puzzle = test.removeNumbers(JSON.parse(JSON.stringify(test.grid)), 40)
// console.log(puzzle.join('/'))
// console.log(test.grid.join('/'))
// console.log(test.posibilities_grid.join())

module.exports = Sudoku