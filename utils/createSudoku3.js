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

    #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }

    /** Instead of checking for safety at each random attempted number we keep the posible numbers at each location. So, when we place any number at the sudoku grid we also remove that number from the arrays of posible numbers correspondig the same row, column and quadrant. That way any time we were to attempt a random number that random number would be guaranteed to be safe. */
    #removeFromPosibilities(grid, number, row, col) {
        const changes = []
        // Same 3x3 quadrant posibilities
        const startRow = row - row % 3
        const startCol = col - col % 3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = startRow + i
                const c = startCol + j
                const index = grid[r][c].indexOf(number)
                if (index >= 0) {
                    grid[r][c].splice(index, 1)
                    changes.push({ row: r, col: c, num: number, i: index })
                }
            }
        }

        // Same row posibilities
        for (let n = 0; n < 9; n++) {
            const index = grid[row][n].indexOf(number)
            if (index >= 0) {
                grid[row][n].splice(index, 1)
                changes.push({ row: row, col: n, num: number, i: index })
            }
        }
        // Same column posibilities
        for (let n = 0; n < 9; n++) {
            const index = grid[n][col].indexOf(number)
            if (index >= 0) {
                grid[n][col].splice(index, 1)
                changes.push({ row: n, col: col, num: number, i: index })
            }
        }

        return changes
    }

    #revertPosibilities(grid, changes) {
        for (const { row, col, num, i } of changes) {
            const cell = grid[row][col]
            if (!cell.includes(num)) {
                if (i >= 0 && i <= cell.length) cell.splice(i, 0, num)
                else cell.push(num)
            }
        }
    }

    /**
     * This function assign the number to the selected location. It also removes the number from the related arrays at posibilities grid.
     * @param {*} number The number to be assigned.
     * @param {*} row The index of the grid array elements, wich represents a row position.
     * @param {*} col The index of the row array elements, wich represents a column position.
     */
    #asignNumber(posibilities_grid, number, row, col) {
        // console.log('---> attempted number:', number, row, col)
        if (posibilities_grid[row][col].includes(number)) {
            this.grid[row].splice(col, 1, number)
            return true
        } 
        // console.log('do not fit', posibilities_grid[row][col])
        return false
        
    }

    #removeNumber(row, col) {
        this.grid[row].splice(col, 1, 0)
    }

    /** Looks for the cell with the minimum number of posible numbers to try. If that cell has not posible numbers to try, then we are at a dead end and we return false to back-track. If it returns null, then the sudoku is solved.
    */
    #findNextCellToTry(grid, posibilities) {
        let min = Infinity
        let best = null
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    const len = posibilities[i][j].length
                    if (len === 0) return { row: i, col: j, deadEnd: true } // direct dead end
                    if (len < min) {
                        min = len
                        best = { row: i, col: j }
                        if (min === 1) return best // early exit, best possible
                    }
                }
            }
        }
        return best
    }

    /**
     * This recursive and backtracking function is in charge of producing a fully solved sudoku. It receives an empty or partially empty grid and utterly sets a fully solved grid at the class prop.
     * @param {*} grid A sudoku grid.
     * @returns A boolean, true if the grid is solved and false otherwise. This values enhances and allows the recursive behaviour.
     */
    #solveSudoku(grid, posibilities) {
        const cell = this.#findNextCellToTry(grid, posibilities)
        if (cell === null) return true
        if (cell.deadEnd) return false
        const { row, col } = cell

        // console.log('---> At:', row, col)
        // We shuffle the array of posible numbers to guarantee randomness at each cell.
        const shuffled_array = this.#shuffleArray([...posibilities[row][col]])
        // console.log(shuffled_array)
        if (shuffled_array.length <= 0) return false

        // We try each posible number. For each, we then call the solveSudoku function again to tell if the sudoku is solvable given the number we are tying. Is solvable, we keep the number, if not we try the next number. When we are at a dead end the array of posible numbers will be empty, this is, the sudoku is not solvable, then we back-track. We back-track as well when any number of the array of posible numbers at the location leads us to a dead end. This means, we return to the previous location iteration, dicard the already tried number and keep trying with the other numbers. For example, suppose we are trying with number 5 at the [5][7] location. We will then fill the grid with 5 at [5][7] and then proceed to try the posible numbers at [5][8] (call again the solveSudoku function with the partially filled grid with 5 at [5][7]). If at the later location we found an empty array of posible numbers the algorithm returns to [5][7], discards 5 and try another number. If any of the numbers of the array of posible numbers at [5][7] leads us to a solution, then we return to [5][6] and try another number and so on, and iterate like that till we find a solvable path.
        for (const number of shuffled_array) {
            if (!this.#asignNumber(posibilities, number, row, col)) continue

            const changes = this.#removeFromPosibilities(posibilities, number, row, col)
            if (this.#solveSudoku(grid, posibilities)) {
                return true
            }
            // console.log('---> number do not fit:', number, row, col)
            this.#removeNumber(row, col)
            this.#revertPosibilities(posibilities, changes)
        }

        return false
    }

    generateSudoku() {
        this.grid = this.#generateEmptyGrid()
        this.#posibilities_grid = this.#generatePosibilitiesGrid() 
        this.#solveSudoku(this.grid, this.#posibilities_grid)
    }

    // Code for creating a puzzle from a full sudoku

    #getPossibleValues(grid, row, col) {
        const possible = new Set([1,2,3,4,5,6,7,8,9])
        // Remove numbers in the same row
        for (let j = 0; j < 9; j++) {
            possible.delete(grid[row][j])
        }
        // Remove numbers in the same column
        for (let i = 0; i < 9; i++) {
            possible.delete(grid[i][col])
        }
        // Remove numbers in the same 3x3 box
        const startRow = row - row % 3
        const startCol = col - col % 3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                possible.delete(grid[startRow + i][startCol + j])
            }
        }
        return Array.from(possible)
    }

    #isSolvable(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const possible = this.#getPossibleValues(grid, row, col)
                    if (possible.length === 1) {
                        return true
                    }
                }
            }
        }
        return false
    }


    removeNumbers(grid, count) {
        let attempts = 0
        while (count > 0 && attempts < 1000) {
            const row = Math.ceil(Math.random() * 9) - 1
            const col = Math.ceil(Math.random() * 9) - 1

            if (grid[row][col] !== 0) {
                const backup = grid[row][col]
                grid[row][col] = 0

                if (this.#isSolvable(grid)) {
                    count --
                } else {
                    grid[row][col] = backup
                }
            }

            attempts++
        }

        return grid
    }

}

// const test = new Sudoku()
// test.generateSudoku()
// const puzzle = test.removeNumbers(JSON.parse(JSON.stringify(test.grid)), 40)
// console.log(puzzle.join('/'))
// console.log(test.grid.join('/'))
// console.log(test.posibilities_grid.join())

module.exports = Sudoku