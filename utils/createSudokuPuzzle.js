const Utils = require('./sudokuUtils')
const DifficultyHandler = require('./difficultyHandler')

class Puzzle {
    empty_possibilities_grid

    static generateEmptyPossibilitiesGrid() {
        const grid = Array.from({ length: 9}, () => Array.from({ length: 9}, () => 0))
        return grid
    }

    /**
     * A recursive function that counts the number of solutions for a given sudoku grid. We use this to filter solvable puzzles (the ones with a single solution).
     * @param {*} grid The sudoku grid.
     * @returns The number of solutions found, any number greater than 1 means the puzzle is not valid.
     */
    #countSolutions(grid) {
        const cell = Utils.findNextCellToTry(grid, this.empty_possibilities_grid)
        if (cell === null) return 1 // Means the puzzle is solved, there are not cells left to try.
        if (cell.deadEnd) return 0 // Means that there are no posible numbers to try at any cell, so either we made a mistake placing a number or the puzzle is not solvable.
        const {row, col} = cell

        let count = 0
        // We clone the posibilities array to avoid mutating it while we are still trying numbers at the current location. If it is modified, then if we try the next value we will have incorrect data. Remember, every try implies hypotetical information that should not affect the next tries at the same location.
        const possibilities = [...this.empty_possibilities_grid[row][col]]
        for (const value of possibilities) {
            if (!Utils.asignNumber(this.empty_possibilities_grid, value, row, col, grid)) continue
            // console.log('---> Testing value for solvability:', value, row, col, JSON.stringify(grid))
            const changes = Utils.removeFromPossibilities(this.empty_possibilities_grid, value, row, col)
            const sub = this.#countSolutions(grid)

            //After every try we reset the modified data.
            grid[row][col] = 0
            Utils.revertPossibilities(this.empty_possibilities_grid, changes)

            count += sub
            // if (count >= 2) break
        }

        return count
    }

    #isSolvable(mainGrid) {
        const grid = JSON.parse(JSON.stringify(mainGrid))

        this.empty_possibilities_grid = Puzzle.generateEmptyPossibilitiesGrid();
        for (let r = 0; r < 9; r++) {
            for (let r_col = 0; r_col < 9; r_col++) {
                if (grid[r][r_col] === 0) {
                    this.empty_possibilities_grid[r][r_col] = Utils.getPossibleValues(grid, r, r_col);
                }
            }
        }
        
        const solutionsCount = this.#countSolutions(grid, this.empty_possibilities_grid)
        // console.log(this.#empty_posibilities_grid)

        // console.log('---> Solutions found:', solutionsCount)
        return solutionsCount === 1
    }


    static removeNumbers(grid, count, previousAttempts) {
        const auxInstance = new Puzzle()
        // count = 80
        const auxCount = count
        const auxGrid = JSON.parse(JSON.stringify(grid))
        this.empty_possibilities_grid = Puzzle.generateEmptyPossibilitiesGrid()
        let attempts = previousAttempts || 1
        let deadEnds = 0

        // First we generate a shuffled array of coordinates to randomly pick wich one to take a number from.
        const coords = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                coords.push({ row: r, col: c })
            }
        }
        const shuffledCoords = Utils.shuffleArray(coords)

        while (count > 0 && shuffledCoords.length > 0) {
            const { row, col } = shuffledCoords.pop()

            //We make sure there is a valid value to remove.
            if (grid[row][col] !== 0) {
                const backup = grid[row][col]
                grid[row][col] = 0
                this.empty_possibilities_grid[row][col] = Utils.getPossibleValues(grid, row, col)
                Utils.updatePossibilitiesGrid(grid)
                // console.log(JSON.stringify(grid))
                
                if (auxInstance.#isSolvable(grid)) {
                    // console.log('is solvable')
                    // console.log(JSON.stringify(grid))
                    count --
                } else {
                    // console.log('not solvable')
                    grid[row][col] = backup
                    this.empty_possibilities_grid[row][col] = 0
                    Utils.updatePossibilitiesGrid(grid)
                    deadEnds ++
                }
            }
            
        }
        
        // console.log('---> Dead ends =', deadEnds, ' Numbers removed =', auxCount - count)
        if (attempts < 500 && count !== 0) {
            // console.log('Failed operation, reverting to original grid and trying again...')
            attempts ++
            return this.removeNumbers(auxGrid, auxCount, attempts)
        } else if (attempts >= 500 && count !== 0) {
            console.log(`Max attempts (${attempts}) reached, aborting...`)
        }
        if (count !== 0) return
        console.log(`---> Succesful operation with ${attempts} attempts, removed ${auxCount - count} numbers <---`)
        // console.log(JSON.stringify(this.#empty_posibilities_grid))
        // console.log(JSON.stringify(grid))
        const difficulty = DifficultyHandler.getLogicDifficulty(grid)
        console.log(difficulty)
        return grid
    }
}

module.exports = Puzzle