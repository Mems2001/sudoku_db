const Utils = require('./sudokuUtils')
class DifficultyHandler {
    /**
     * Allows us to get the posible numbers to be placed at a given location in the grid.
     * @param {*} grid The sudoku grid.
     * @param {*} row The row index.
     * @param {*} col The column index.
     * @returns An array of posible numbers to be placed at the given location. An empty array if there is no possible values left. The latter is needed to future checks at #findNextCellToTry, this tells us that we reached a dead end.
     */
    #getPossibleValues(row, col, possibilities_grid) {
        // console.log('---> Possibilities grid for getting possible values: ', JSON.stringify(possibilities_grid))
        const result = possibilities_grid[row][col] ?? []
        // console.log('---> Possible values from possibilities grid: ', result)

        // return { result: Array.from(possible), result2: result}
        return result
    }

    /**
     * This functions will take the difficulty and return the conditions for a puzzle to meet in order to satisfy that difficulty.
     * @param {*} difficulty 
     * @returns An object with the min and max numbers to remove and the ultimate logic used to solved it (the last resource, even if it uses naked singles it will account only for the most complex logic reached when trying to solve it).
     */
    static conditionsByDifficulty(difficulty) {
        // console.log('---> Difficulty to determine the ammount of numbers to remove:', difficulty)
        let conditions = {
            number: undefined,
            min: undefined,
            max: undefined,
            ultLogic: undefined
        }

        switch (difficulty) {
            case 0:
                conditions.min = 15
                conditions.max = 25
                conditions.number = Utils.throwRandomNumber(15, 25)
                conditions.ultLogic = 0
                break
            case 1:
                conditions.min = 25
                conditions.max = 35
                conditions.number = Utils.throwRandomNumber(25, 35)
                conditions.ultLogic = 1
                break
            case 2:
                conditions.min = 35
                conditions.max = 45
                conditions.number = Utils.throwRandomNumber(35, 45)
                conditions.ultLogic = 1
                break
            case 3:
                conditions.min = 45
                conditions.max = 55
                conditions.number = Utils.throwRandomNumber(45, 55)
                conditions.ultLogic = 2
                break
            case 4: 
                conditions.min = 55
                conditions.max = 60
                conditions.ultLogic = 4
                break
            case 5:
                conditions.min = 60
                conditions.max = 65
                conditions.ultLogic = 5
                break
        }

        // console.log(conditions)
        return conditions
    }

    /**
     * Scans the grid for cells that have only one possible value.
     * @param {Array} grid The current 9x9 Sudoku grid.
     * @param {*} possibilities_grid
     * @returns {Array} An array of objects {row, col, value} for every naked single found.
     */
    #findHiddenSingles(grid, possibilities_grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Only check empty cells
                if (grid[r][c] === 0) {
                    const possibilities = this.#getPossibleValues(r, c, possibilities_grid)

                    // If there's only one number that can fit here, it's a hidden single.
                    if (possibilities.length === 1) {
                        return {
                            row: r,
                            col: c,
                            value: possibilities[0]
                        }
                    }
                }
            }
        }
    }

    /**
     * A number that can only fit in one spot within a row, column, or box.
     * @param {*} grid 
     * @param {*} possibilities_grid 
     */
    #findNakedSingles(grid, possibilities_grid) {
        for (let num = 1; num <= 9; num++) {
            // Check Rows
            for (let r = 0; r < 9; r++) {
                let possibleCols = []
                for (let c = 0; c < 9; c++) {
                    const possible_values = this.#getPossibleValues(r, c, possibilities_grid)
                    if (grid[r][c] === 0 && possible_values.includes(num)) {
                        possibleCols.push(c)
                    }
                }
                if (possibleCols.length === 1) return { row: r, col: possibleCols[0], value: num }
            }

            // Check Columns
            for (let c = 0; c < 9; c++) {
                let possibleRows = []
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(r, c, possibilities_grid).includes(num)) {
                        possibleRows.push(r)
                    }
                }
                if (possibleRows.length === 1) return { row: possibleRows[0], col: c, value: num }
            }

            // Check Boxes
            for (let b = 0; b < 9; b++) {
                let possibleCells = []
                const startR = Math.floor(b / 3) * 3
                const startC = (b % 3) * 3
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        let r = startR + i, c = startC + j
                        if (grid[r][c] === 0 && this.#getPossibleValues(r, c, possibilities_grid).includes(num)) {
                            possibleCells.push({ r, c })
                        }
                    }
                }
                if (possibleCells.length === 1) return { row: possibleCells[0].r, col: possibleCells[0].c, value: num }
            }
        }
        return null
    }

    // Look for two cells with the same two posible numbers. This means those can be removed as posibilities for all the other cells in the same row, column or quadrant.
    #findNakedPair(grid, possibilities_grid) {
        //1. We need a map of all possibilities for all empty cells first
        const possibilitiesMap = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    possibilitiesMap.push({ row: r, col: c, values: this.#getPossibleValues(r, c, possibilities_grid) })
                }
            }
        }

        // 2. Look for two cells in the same row/col/box with the same two numbers
        const pairs = possibilitiesMap.filter(cell => cell.values.length === 2)

        for (let i = 0; i < pairs.length; i++) {
            for (let j = i + 1; j < pairs.length; j++) {
                const p1 = pairs[i]
                const p2 = pairs[j]

                // Check if they have the same numbers
                if (p1.values[0] === p2.values[0] && p1.values[1] === p2.values[1]) {
                    // Check if they share location (Row, Col, or Quadrant)
                    const location = []
                    const sameRow = p1.row === p2.row
                    const sameCol = p1.col === p2.col
                    const sameQuadrant = (Math.floor(p1.row/3) === Math.floor(p2.row/3)) && 
                    (Math.floor(p1.col/3) === Math.floor(p2.col/3))

                    if (sameRow) location.push('row')
                    if (sameCol) location.push('col')
                    if (sameQuadrant) location.push('quadrant')
                    
                    if (location.length > 0) {
                        const candidateConstraint = {
                            p1,          // Pass the entire cell object
                            p2,          // Pass the entire cell object
                            values: p1.values,
                            location
                        }
                        
                        if (Utils.isConstraintUseful(possibilities_grid, candidateConstraint)) {
                            // We would now remove p1.p numbers from other cells in that unit. If that removal results in a new Naked Single elsewhere, the logic has progressed.
                            return { p1, p2, values: p1.values, location }
                        }
                    }
                }
            }
        }
        return null
    }

    /**
     * Pointing Pairs/Triples. If all candidates for a number in a quadrant are restricted to a single row or column, that number can be removed from the rest of that row or column outside the quadrant.
     */
    #findPointingTriple(grid, possibilities_grid) {
        //Iterate  by quadrants
        for (let b = 0; b < 9; b++) {
            const startR = Math.floor(b / 3) * 3
            const startC = (b % 3) * 3

            let possibleCells = []
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let r = startR + i
                    let c = startC + j
                    if (grid[r][c] === 0) {
                        possibleCells.push({ row: r, col: c, values: this.#getPossibleValues(r, c, possibilities_grid) })
                    }
                }
            }
            
            if (possibleCells.length === 3) {
                // console.warn(possibleCells)
                const values = Array.from(new Set(possibleCells.map(cell => cell.values).flat()))
                // console.warn(values)
                if (values.length !== 3) continue
                if (!possibleCells.every(cell => cell.values.length >= 2)) continue
                const pairs = possibleCells.filter(cell => cell.values.length === 2)
                if (pairs.length >= 2) {
                    if (pairs.every(cell => cell.values[0] !== pairs[0].values[0] || cell.values[1] !== pairs[0].values[1] && cell.values[0] !== pairs[0].values[1] || cell.values[1] !== pairs[0].values[0])) continue
                }
                const location = []
                const sameRow = possibleCells.every(cell => cell.row === possibleCells[0].row)
                const sameCol = possibleCells.every(cell => cell.col === possibleCells[0].col)
                if (sameRow) location.push('row')
                if (sameCol) location.push('col')
                    
                if (location.length > 0) {                   
                    location.push('quadrant')
                    // Check if this actually eliminates anything outside the box. This is crucial to ensure the logic actually "progresses"
                    const constraint = {
                        p1: possibleCells[0],
                        p2: possibleCells[1],
                        p3: possibleCells[2] ?? null,
                        values,
                        location
                    }
                    // console.log('---> Candidate pointer found: ', constraint)
                    if (Utils.isConstraintUseful(possibilities_grid, constraint)) {
                        return constraint
                    }
                }
            }
        }
        return null
    }

    /**
     * This functions looks for groups of 2 or 3 cells within a box and row or column that all contain the same single candidate. If so, that candidate can be removed from the rest of that row or column outside the box.
     * @param {*} grid 
     * @param {*} possibilities_grid 
     * @returns 
     */
    #findPointingSingles(grid, possibilities_grid) {
        for (let q = 0; q < 9; q ++) {
            const startR = Math.floor(q / 3) * 3
            const startC = (q % 3) * 3

            for (let num = 1; num <= 9; num ++) {
                let possibleCells = []
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        let r = startR + i
                        let c = startC + j
                        if (grid[r][c] === 0) {
                            const values = this.#getPossibleValues(r, c, possibilities_grid)
                            if (values.includes(num)) possibleCells.push({ row: r, col: c, values:[num] })
                        }
                    }
                }
    
                if (possibleCells.length >= 2 && possibleCells.length <= 3) {
                    const values = Array.from(new Set(possibleCells.map(cell => cell.values).flat()))
                    if (values.length > 1) continue
                    const location = []
                    const sameRow = possibleCells.every(cell => cell.row === possibleCells[0].row)
                    const sameCol = possibleCells.every(cell => cell.col === possibleCells[0].col)
                    if (sameRow) location.push('row')
                    if (sameCol) location.push('col')
    
                    if (location.length > 0) {
                        const constraint = {
                            p1: possibleCells[0],
                            p2: possibleCells[1],
                            p3: possibleCells[2] ?? null,
                            values,
                            location
                        }
                        // console.log('---> Found pointing single:', constraint)
                        if (Utils.isConstraintUseful(possibilities_grid, constraint)) {
                            return constraint
                        }
                    }
                }
            }
        }
    }

    /**
     * Simulates a human solver to rate the difficulty of a given puzzle.
     * @param {*} mainGrid The puzzle to be tested.
     * @param {number} removed_numbers The ammount of numbers removed to this point.
     * @param {*} difficulty_conditions An object which contains: {min: the minimun ammount of numbers to be removed, max: the maximum ammount of numbers to be removed, number: the targeted ammount of numbers to be removed, ultLogic: the main strategy expected to this difficulty}.
     * @param {*} possibilities_grid The grid of possible values to be placed at each location. Obtained by hidden simples logic.
     * @returns {*}
     **/
    static getPuzzleDifficulty(mainGrid, removed_numbers, difficulty_conditions, possibilities_grid) {
        // console.log('---> Possibilities for getting the difficutly:', JSON.stringify(possibilities_grid ))
        let difficulty
        let solvingStrategy = 0
        const handler = new DifficultyHandler()
        let grid = JSON.parse(JSON.stringify(mainGrid))
        let totalEmpty = grid.flat().filter(v => v === 0).length
        let solvedCount = 0
        let naked_singles = 0
        let hidden_singles = 0
        let naked_pairs = 0
        let triple = 0
        let single = 0

        // Iteration logic to keep trying to solve the puzzle until no strategies are left to apply. It runs out only when the strategies are over, not when the puzzle is solved. That's how we double check if it is solvable. If this returns undefined then the puzzle is not solvable after all.
        while (true) { 
            // 1. (placer) Prioritize Naked Singles.
            const naked_single = handler.#findNakedSingles(grid, possibilities_grid)
            if (naked_single) {
                // if (naked_pairs) console.log('Found naked single:', single)
                const {row, col, value} = naked_single
                const updated_possibilities = Utils.removeFromPossibilities(possibilities_grid, value, row, col) // We update the possibilities grid to keep trying to solve the puzzle with other strategies.
                if (updated_possibilities.changes.length === 0) continue

                grid[row][col] = value
                solvedCount ++
                naked_singles ++
                possibilities_grid = updated_possibilities.possibilities_grid
                if (!solvingStrategy) solvingStrategy = 0
                continue // Found something, iterate again to try with updated data.
            }  

            // 2. (placer) If step 1 found nothing then we look for Hidden Singles.
            const hidden = handler.#findHiddenSingles(grid, possibilities_grid)
            if (hidden) {
                const {row, col, value} = hidden
                if (grid[row][col] === 0) {
                    const updated_possibilities = Utils.removeFromPossibilities(possibilities_grid, value, row, col) // We update the possibilities grid to keep trying to solve the puzzle with other strategies.
                    // if (naked_pairs) console.log('Found hidden single:', hidden, JSON.stringify(updated_possibilities.possibilities_grid), JSON.stringify(grid), ' possibilities removed: ', updated_possibilities.changes.length)
                    if (updated_possibilities.changes.length === 0) continue

                    grid[row][col] = value
                    solvedCount ++
                    hidden_singles ++
                    possibilities_grid = updated_possibilities.possibilities_grid
                    solvingStrategy = Math.max(solvingStrategy, 1)
                    continue // Call another iteration with now updated data.
                }
            }

            // 3. (remover) If stuck we now look for naked pairs. 
            const pair = handler.#findNakedPair(grid, possibilities_grid)
            if (pair) {
                // Instead of breaking, we add the pair to our "constraints", and try the loop again to see if it changed the possibilities grid.
                const new_constraint = {
                    p1: pair.p1,
                    p2: pair.p2,
                    p3: undefined,
                    values: pair.p1.values,
                    location: pair.location
                }
                
                const updated_possibilites = Utils.removeConstraintsFromPossibilities(possibilities_grid, new_constraint)
                // Double check if progress was made. The first check is at isConstraintUseful inside #findNakedPairs
                if (updated_possibilites.ammount_removed === 0) continue
                // console.warn(`--->Useful naked pair found (${solvedCount} numbers solved to this point): `, new_constraint, JSON.stringify(updated_possibilites.possibilities_grid), JSON.stringify(grid), ' possibilities removed: ', updated_possibilites.ammount_removed)
                naked_pairs ++
                possibilities_grid = updated_possibilites.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 2)
                continue
            }

            //5. (remover) Now we look for pointing singles.
            const pointing_single = handler.#findPointingSingles(grid, possibilities_grid)
            if (pointing_single) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, pointing_single)
                if (updated_possibilities.ammount_removed === 0) break
                single ++
                // console.warn(`---> Useful pointing single found (${solvedCount} numbers solved to this point): `, pointing_single, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 3)
                continue
            }
            
            //4. (remover) If still stuck we look for pointing pairs/triples.
            const pointing_triple = handler.#findPointingTriple(grid, possibilities_grid)
            if (pointing_triple) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, pointing_triple)
                if (updated_possibilities.ammount_removed === 0) break
                triple ++
                // console.warn(`---> Useful pointing triple found (${solvedCount} numbers solved to this point): `, pointing_triple, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 4)
                continue
            }

            // If we reach here, we are stuck (No Singles left)
            // console.log(solvedCount, totalEmpty, JSON.stringify(possibilities_grid))
            break
        }

        const isFullySolved = (solvedCount === totalEmpty)

        if (isFullySolved) {
            // if (naked_pairs) console.log('---> Fully solved')
            // if (naked_pairs) console.log(`grid status(${solvedCount} / ${totalEmpty}): `, JSON.stringify(grid), JSON.stringify(possibilities_grid))

            if (removed_numbers === difficulty_conditions.number) difficulty = 0 //novice
            if ((removed_numbers === difficulty_conditions.number && difficulty_conditions.number > 25 && difficulty_conditions.number <= 35) && (solvingStrategy >= 0)) difficulty = 1 //easy
            if (removed_numbers === difficulty_conditions.number && difficulty_conditions.number > 35 && difficulty_conditions.number <= 45 && (solvingStrategy >= 1)) difficulty = 2 //normal
            if (removed_numbers === difficulty_conditions.number && difficulty_conditions.number > 45 && (solvingStrategy >= 3)) difficulty = 3 //hard
        } else {
            // if (naked_pairs) console.log(`---> Grid status(${solvedCount} / ${totalEmpty}): `, JSON.stringify(grid), JSON.stringify(possibilities_grid))
        }

        // if (naked_pairs) console.log('---> Difficulty determined:', difficulty, solvingStrategy, "removed numbers: ", removed_numbers, "solved numbers: ", solvedCount, "total empty: ", totalEmpty, ` Naked singles: ${naked_singles}, Hidden singles: ${hidden_singles}, Naked pairs: ${naked_pairs}, Pointing groups: ${pointing_triple}`)
        return {difficulty, solvingStrategy, strategies_used: {naked_singles, hidden_singles, naked_pairs, triple, single}}
    }
}

module.exports = DifficultyHandler