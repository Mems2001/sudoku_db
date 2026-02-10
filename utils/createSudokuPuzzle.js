const Utils = require('./sudokuUtils')
const DifficultyHandler = require('./difficultyHandler')

class Puzzle {
    static generateEmptyPossibilitiesGrid() {
        const grid = Array.from({ length: 9}, () => Array.from({ length: 9}, () => 0))
        return grid
    }

    /**
     * A recursive function that counts the number of solutions for a given sudoku grid. We use this to filter solvable puzzles (the ones with a single solution).
     * @param {*} grid
     * @param {*} possibilities_grid
     * @returns The number of solutions found, any number greater than 1 means the puzzle is not valid.
     */
    #countSolutions(grid, possibilities_grid) {
        const cell = Utils.findNextCellToTry(grid, possibilities_grid)
        if (cell === null) return 1 // Means the puzzle is solved, there are not cells left to try.
        if (cell.deadEnd) return 0 // Means that there are no posible numbers to try at any cell, so either we made a mistake placing a number or the puzzle is not solvable.
        const {row, col} = cell

        let count = 0
        // We clone the posibilities array to avoid mutating it while we are still trying numbers at the current location. If it is modified, then if we try the next value we will have incorrect data. Remember, every try implies hypotetical information that should not affect the next tries at the same location.
        const possibilities = [...possibilities_grid[row][col]]
        for (const value of possibilities) {
            if (!Utils.asignNumber(possibilities_grid, value, row, col, grid)) continue
            // console.log('---> Testing value for solvability:', value, row, col, JSON.stringify(grid))
            const new_possibilities = Utils.removeFromPossibilities(possibilities_grid, value, row, col)
            // console.log('---> Updated possibilities:', JSON.stringify(new_possibilities))
            possibilities_grid = new_possibilities.possibilities_grid
            const changes = new_possibilities.changes
            const sub = this.#countSolutions(grid, possibilities_grid)

            //After every try we reset the modified data.
            grid[row][col] = 0
            possibilities_grid = Utils.revertPossibilities(possibilities_grid, changes).possibilities_grid
            // console.log('---> After reverting:', JSON.stringify(possibilities_grid))

            count += sub
            if (count > 1) break
        }

        return count
    }

    /**
     * This functions check if a given puzzle grid is solvable by finding if there is at least one solution and no more than one. 
     * @param {*} mainGrid 
     * @returns An object with two main props. First isSolvable: A boolean that answers if it is solvable or not, and possibilities_grid: an updated grid of possibilities obtained just by elimininatig possible values for column, row and quadrant (hidden singles logic).
     */
    #isSolvable(mainGrid) {
        const grid = mainGrid.map(row => [...row])
        let possibilities_grid = Puzzle.generateEmptyPossibilitiesGrid()
        // console.log(possibilities_grid)

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    possibilities_grid[row][col] = Utils.getPossibleValues(grid, row, col)
                }
            }
        }
        
        const solutionsCount = this.#countSolutions(grid, possibilities_grid)
        // console.log(this.#empty_posibilities_grid)

        // console.log('---> Solutions found:', solutionsCount)
        return {is_solvable: solutionsCount === 1, possibilities_grid}
    }

    static removeNumbers(grid, difficulty) {
        const auxInstance = new Puzzle()
        const difficulty_conditions = DifficultyHandler.conditionsByDifficulty(difficulty)
        let target_count = difficulty_conditions.number ?? difficulty_conditions.max
        let attempts = 1
        let max_attempts = 500
        let possibilities_grid = this.generateEmptyPossibilitiesGrid()
        
        // First we generate a shuffled array of coordinates to randomly pick wich one to take a number from.
        const coords = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                coords.push({ row: r, col: c })
            }
        }
        const shuffledCoords = Utils.shuffleArray(coords)
        let possibilities = [...possibilities_grid]

        /**
         * A function that iterates to check if the puzzle fits the requirements. If the puzzle is not solvable it is called again. Every iteration removes a number, if the puzzle is solvable iterates again to remove another number at a different cell. 
         * @param {*} current_grid The updated puzzle grid to be checked. Is updated at every removal/iteration and reset to defeault if backtrack failed to find a solution.
         * @param {*} index The position at the shuffled coordinates array that is currently being checked. 
         * @param {*} ammount_removed 
         * @returns The puzzle grid if the requirements were met or null if not.
         */
        function backtrack(current_grid, index, ammount_removed, possibilities_grid) {
            // console.log('---> Possibilities for backtracking:', JSON.stringify(possibilities_grid))
            // console.warn('---> Attempts left: ', 500 - attempts)
            if (attempts === max_attempts) {
                return "limit_reached"
            }

            //We check if the ammount removed fits the target (to evaluate if the puzzle met the requierements).
            if (ammount_removed === target_count) {
                //If so, we check if it meets the required difficulty. If it does we return the grid as a successfull puzzle, if not, we return null to trigger the backtrack.
                if (difficulty === DifficultyHandler.getPuzzleDifficulty(current_grid, ammount_removed, difficulty_conditions, possibilities_grid)) {
                    console.log('---> Success! puzzle obtained with difficulty: ', difficulty, ", ", ammount_removed, ' numbers removed and ', attempts, ' attempts.')
                    return current_grid
                }

                return null
            }

            for (let i = index; i < shuffledCoords.length; i++) {
                const {row, col} = shuffledCoords[i]
                const backup = current_grid[row][col]
                if (backup === 0) continue

                current_grid[row][col] = 0

                // Check for solvability
                const is_solvable = auxInstance.#isSolvable(current_grid)
                if (is_solvable.is_solvable) {
                    //If it is solvable, at this place we are sure this grid do not meet the success conditions so we start another iteration. If that is not null the the puzzle was successfuly produced and we return the grid obtained (see the previous step).
                    const result = backtrack(current_grid, index = i + 1, ammount_removed + 1, is_solvable.possibilities_grid)
                    if (result === 'limit_reached') return "limit_reached"
                    if (result) return result
                }

                // If we get to this point then the puzzle is not solvable, so we backtrack.
                // console.log('---> Failed to solve at: ', shuffledCoords[i], ' numbers removed to this point: ', ammount_removed + 1, ' backtracking...')
                current_grid[row][col] = backup
            }

            //If the puzzle is not solvable this returns nothing and backtrack is called again but with reset values.
            attempts ++
            return null
        }
        
        const final_result = backtrack(grid, 0, 0, possibilities)
        if (final_result === 'limit_reached') {
            console.error(`---> Max attempts reached (${attempts})`)
            return null
        }
        return final_result
    }
}

module.exports = Puzzle