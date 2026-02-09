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
            if (count > 1) break
        }

        return count
    }

    #isSolvable(mainGrid) {
        const grid = mainGrid.map(row => [...row])

        this.empty_possibilities_grid = Puzzle.generateEmptyPossibilitiesGrid()
        for (let r = 0; r < 9; r++) {
            for (let r_col = 0; r_col < 9; r_col++) {
                if (grid[r][r_col] === 0) {
                    this.empty_possibilities_grid[r][r_col] = Utils.getPossibleValues(grid, r, r_col)
                }
            }
        }
        
        const solutionsCount = this.#countSolutions(grid, this.empty_possibilities_grid)
        // console.log(this.#empty_posibilities_grid)

        // console.log('---> Solutions found:', solutionsCount)
        return solutionsCount === 1
    }

    static removeNumbers(grid, difficulty) {
        const auxInstance = new Puzzle()
        const difficulty_conditions = DifficultyHandler.conditionsByDifficulty(difficulty)
        let target_count = difficulty_conditions.number ?? difficulty_conditions.max
        let attempts = 1
        
        // First we generate a shuffled array of coordinates to randomly pick wich one to take a number from.
        const coords = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                coords.push({ row: r, col: c })
            }
        }
        const shuffledCoords = Utils.shuffleArray(coords)

        function backtrack(current_grid, index, ammount_removed) {
            //We first check if the ammount removed fits the target. 
            if (ammount_removed === target_count) {
                //If so, we check if it meets the required difficulty. If it does we return the grid as a successfull puzzle, if not, we return null to trigger the backtrack.
                if (difficulty === DifficultyHandler.getPuzzleDifficulty(current_grid, ammount_removed, difficulty_conditions)) {
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
                if (auxInstance.#isSolvable(current_grid)) {
                    //If it is solvable, at this place we are sure this grid do not meet the success conditions so we start another iteration. If that is not null the the puzzle was successfuly produced and we return the grid obtained (see the previous step).
                    const result = backtrack(current_grid, i + 1, ammount_removed + 1)
                    if (result) return result
                }

                // If we get to this point then the puzzle is not solvable, so we backtrack.
                // console.log('---> Failed to solve at: ', shuffledCoords[i], ' numbers removed to this point: ', ammount_removed + 1, ' backtracking...')
                current_grid[row][col] = backup
            }

            attempts ++
            return null
        }

        return backtrack(grid, 0, 0)
    }
}

module.exports = Puzzle