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

        // Getting the possibilities grid.
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    possibilities_grid[row][col] = Utils.getPossibleValues(grid, row, col) // Hidden singles logic applied.
                }
            }
        }
        
        // This will serve to verify if the puzzle has the requested number of solutions, 1.
        const solutionsCount = this.#countSolutions(grid, possibilities_grid)
        // console.log(this.#empty_posibilities_grid)

        // console.log('---> Solutions found:', solutionsCount)
        return {is_solvable: solutionsCount === 1, possibilities_grid}
    }

    /**
     * This function is in charge to try every possible way to remove a certain ammount numbers given a grid and a target difficulty. It may not reach a solvable puzzle and that's why it has an internal limit for its iterations. The reason is that while the possible ways to remove a given ammount of numbers within a 9*9 matrix is finite but huge (Using the binomial coefficient for example, with 45 removals we got 4.384529 * 10**22 posible paths to try. So the computation is not doable in a reasonable ammount of time).
     * @param {*} grid 
     * @param {*} difficulty 
     * @returns 
     */
    #removeNumbers(grid, difficulty) {
        console.log('Trying to create a puzzle with difficutly: ', difficulty)
        const auxInstance = new Puzzle()
        const difficulty_conditions = DifficultyHandler.conditionsByDifficulty(difficulty) // Having this here allows us to reset the target of numbers to remove on every global iteration.
        let target_count = difficulty_conditions.number ?? difficulty_conditions.max
        let attempts = 1
        let max_attempts = 500
        let possibilities_grid = Puzzle.generateEmptyPossibilitiesGrid()
        
        // First we generate a shuffled array of coordinates to randomly pick wich one to take a number from.
        const coords = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                coords.push({ row: r, col: c })
            }
        }
        let shuffledCoords = Utils.shuffleArray(coords) // Having this here allows us to reorder the coordinates on every global iteration.
        let possibilities = [...possibilities_grid]

        /**
         * A function that iterates to check if the puzzle fits the requirements. If the puzzle is not solvable it is called again. Every iteration removes a number, if the puzzle is solvable iterates again to remove another number at a different cell. 
         * @param {*} current_grid The updated puzzle grid to be checked. Is updated at every removal/iteration and reset to defeault if backtrack failed to find a solution.
         * @param {number} index The position at the shuffled coordinates array that is currently being checked. 
         * @param {number} ammount_removed 
         * @param {*} possibilities_grid
         * @returns The puzzle grid if the requirements were met or null if not.
         */
        function backtrack(current_grid, index, ammount_removed, possibilities_grid) {
            // console.log('---> Possibilities for backtracking:', JSON.stringify(possibilities_grid))
            // console.warn('---> Attempts left: ', 500 - attempts)

            // 1. We verify if the loop limit was reached.
            if (attempts === max_attempts) return "limit_reached"

            //2. We check if the ammount removed fits the target (to then evaluate if the puzzle met the requierements).
            if (ammount_removed === target_count) {
                //If so, we check if it meets the required difficulty. If it does we return the grid as a successfull puzzle, if not, we return null to trigger the backtrack.
                if (difficulty === DifficultyHandler.getPuzzleDifficulty(current_grid, ammount_removed, difficulty_conditions, possibilities_grid)) {
                    console.log('Success! puzzle obtained with difficulty: ', difficulty, ", ", ammount_removed, ' numbers removed and ', attempts, ' local attempts.')
                    return current_grid
                }

                return null
            }

            // 3. The actual recursion relies here. We loop over the list of coords to try.
            for (let i = index; i < shuffledCoords.length; i++) {
                const {row, col} = shuffledCoords[i]
                const backup = current_grid[row][col]
                if (backup === 0) continue // In case the value is 0 we ommit the rest of the logic since the number was already removed.

                current_grid[row][col] = 0 // Number removal.

                // Check for solvability to decide how to iterate.
                const is_solvable = auxInstance.#isSolvable(current_grid) // Also provides an updated possibilities grid to iterate.
                if (is_solvable.is_solvable) {
                    //If it is solvable, at this place we are sure this grid do not meet the success conditions so we start another iteration. If that is not null the the puzzle was successfuly produced and we return the grid obtained (see the previous step).
                    const result = backtrack(current_grid, index = i + 1, ammount_removed + 1, is_solvable.possibilities_grid)
                    if (result === 'limit_reached') return "limit_reached"
                    if (result) return result
                }

                // If we get to this point then the puzzle is not solvable, so we backtrack. We do not need to revert the possibilities_grid changes since #isSolvable provides an updated one each time it is called.
                current_grid[row][col] = backup
                // console.log('---> Failed to solve at: ', shuffledCoords[i], ' numbers removed to this point: ', ammount_removed + 1, ' backtracking...')
            }

            //If the puzzle is not solvable at all this returns null and backtrack is called again but with reset values.
            // console.log('---> Attempting with the next cell')
            attempts ++
            return null
        }
        
        const final_result = backtrack(grid, 0, 0, possibilities)
        if (final_result === 'limit_reached') {
            console.error(`Max local attempts reached (${attempts})`)
            return null
        }
        return final_result
    }

    /**
     * Main recursive function to create a puzzle. Given the difficulties of exploring all ways to remove a certain ammount of numbers (see removeNumbers docs) we use two main limits for the iterations. One "local" at removeNumbers and the other here. Every local iteration ocurs with the same array of shuffled coordinates, but when the local limit is reached we trigger an iteration here which creates a new array of shuffled coordinates and a new target of numbers to remove. This helps us to reduce the chances of failig to produce a puzzle, in fact, this way the algorithm is near 100% effectivity. 
     * @param {*} sudoku_grid 
     * @param {*} difficulty 
     * @returns A puzzle that matches our difficulty requierements and ready to be solved.
     */
    static createPuzzle(sudoku_grid, difficulty) {
        let attempts = 1
        const max_attempts = 10
        const auxInstance = new Puzzle()

        while (attempts <= max_attempts) {
            console.log('---> Global attempts: ', attempts)

            const grid = sudoku_grid.map(row => [...row])

            const puzzle = auxInstance.#removeNumbers(grid, difficulty)

            if (puzzle) {
                console.log('---> Puzzle created with ', attempts, ' global attempts.')
                return puzzle
            }

            attempts ++
        }

        console.log('---> Critical failure on producing the puzzle, max global attempts reached: ', max_attempts)
        return null
    }
}

module.exports = Puzzle