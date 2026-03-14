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
                conditions.min = 14
                conditions.max = 25
                conditions.ultLogic = 0
                break
            case 1:
                conditions.min = 25
                conditions.max = 35
                conditions.ultLogic = 1
                break
            case 2:
                conditions.min = 35
                conditions.max = 45
                conditions.ultLogic = 1
                break
            case 3:
                conditions.min = 45
                conditions.max = 55
                conditions.ultLogic = 2
                break
            case 4: 
                conditions.min = 55
                conditions.max = 65
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
     * This logic will look for two cells with the same two values located at the same row, column, or quadrant. If so, it will reveal them as naked pairs. This is, we will clean other possible values of that cells untill only two values are left. Then we can find the pair as naked by #findNakedPairs.
     * @param {*} grid 
     * @param {*} possibilities_grid 
     */
    #findHiddenPairs(grid, possibilities_grid) {
        //By rows
        for (let r = 0; r < 9; r ++) {
            const counter = {}
            for (let n = 1; n < 10; n++) {
                for (let j = r + 1; j < 9; j ++) {
                    if (Array.isArray(possibilities_grid[r][j]) && this.#getPossibleValues(r, j, possibilities_grid).includes(n)) {
                        if (!counter[n]) 
                                counter[n] = {
                                count: 1,
                                positions: [{row: r, col: j}]
                            }
                        else {
                            counter[n].count ++,
                            counter[n].positions.push({row: r, col: j})
                        }
                    }
                }
                
            }

            const keys = Object.keys(counter)
            if (keys.length > 1) {
                for (let i = 0; i < keys.length; i ++) {
                    for (let j = i + 1; j < keys.length; j ++) {
                        if (counter[keys[i]].count === counter[keys[j]].count && counter[keys[i]].count === 2) {
                            const positions1 = counter[keys[i]].positions
                            const positions2 = counter[keys[j]].positions
                            // console.log(counter)
                            // console.error('hi', positions1, positions2)
                            if (positions1[0].col === positions2[0].col && positions1[1].col === positions2[1].col) {
                                if (this.#getPossibleValues(positions1[0].row, positions1[0].col, possibilities_grid).length > 2 || this.#getPossibleValues(positions2[1].row, positions2[1].col, possibilities_grid).length > 2) return {
                                    p1: {row: positions1[0].row, col: positions1[0].col},
                                    p2: {row: positions2[1].row, col: positions2[1].col},
                                    values: [parseInt(keys[i]), parseInt(keys[j])]
                                }
                            }
                        }
                    }
                }
            }
        }


        // Now we determine if within the possible_pairs array is there two with the same two values and at the same location unit(row, column, quadrant)
        
    }

    /**
     * This functions looks for a pair of rows or columns with a possible value repeated into two cells equally located inside both rows or columns. If found, then the value can be removed from the alternate coordinate of the row or column it belongs. This is, if i find a pair of cells with the same value and location at two different columns, then, the value can be removed from the rows, not the columns.
     * @param {*} grid 
     * @param {*} possibilities_grid 
     * @returns 
     */
    #findXWingPairs(grid, possibilities_grid) {
        for (let num = 1; num <= 9; num++) {
            const selectedRows = []
            for (let r = 0; r < 9; r++) {
                const selectedPoints = []
                for (let c =0; c < 9; c++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(r, c, possibilities_grid).includes(num)) selectedPoints.push({row: r, col: c, values: [num]})
                }
                if (selectedPoints.length === 2) selectedRows.push(selectedPoints)
            }
            if (selectedRows.length >= 2) {
                for (let i = 0; i < selectedRows.length; i++) {
                    for (let j = selectedRows.length - 1; j >= 0; j--) {
                        if (i === j) continue
                        let matches = 0
                        for (const point of selectedRows[i]) {
                            for (const point2 of selectedRows[j]) {
                                if (point.col === point2.col) matches ++ 
                            }
                        }
                        if (matches === 2) {    
                            // console.log('---> Selected rows for X-wing: ', selectedRows)
                            return {p1: selectedRows[i][0], p2: selectedRows[j][1], values: selectedRows[i][0].values, location: ['x-col']} 
                        }         
                    }
                }
            }

            const selectedCols = []
            for (let c = 0; c < 9; c++) {
                const selectedPoints = []
                for (let r =0; r < 9; r++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(r, c, possibilities_grid).includes(num)) selectedPoints.push({row: r, col: c, values: [num]})
                }
                if (selectedPoints.length === 2) selectedCols.push(selectedPoints)
            }
            if (selectedCols.length >= 2) {
                for (let i = 0; i < selectedCols.length; i++) {
                    for (let j = selectedCols.length - 1; j >= 0; j--) {
                        if (i === j) continue
                        let matches = 0
                        for (const point of selectedCols[i]) {
                            for (const point2 of selectedCols[j]) {
                                if (point.row === point2.row) matches ++ 
                            }
                        }
                        if (matches === 2) {    
                            return {p1: selectedCols[i][0], p2: selectedCols[j][1], values: selectedCols[i][0].values, location: ['x-row']} 
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
        let pointing_triples = 0
        let pointing_singles = 0
        let hidden_pairs = 0
        let x_wing_pairs = 0
        
        // Iteration logic to keep trying to solve the puzzle until no strategies are left to apply. It runs out only when the strategies are over, not when the puzzle is solved. That's how we double check if it is solvable. If this returns undefined then the puzzle is not solvable after all.
        while (true) { 
            // 2. (placer) If step 1 found nothing then we look for Hidden Singles.
            const hidden = handler.#findHiddenSingles(grid, possibilities_grid)
            if (hidden) {
                const {row, col, value} = hidden
                if (grid[row][col] === 0) {
                    const updated_possibilities = Utils.removeFromPossibilities(possibilities_grid, value, row, col) // We update the possibilities grid to keep trying to solve the puzzle with other strategies.
                    // console.log('Found hidden single:', hidden, JSON.stringify(updated_possibilities.possibilities_grid), JSON.stringify(grid), ' possibilities removed: ', updated_possibilities.changes.length)
                    if (updated_possibilities.changes.length === 0) continue

                    grid[row][col] = value
                    solvedCount ++
                    hidden_singles ++
                    possibilities_grid = updated_possibilities.possibilities_grid
                    solvingStrategy = Math.max(solvingStrategy, 1)
                    continue // Call another iteration with now updated data.
                }
            }

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
                pointing_singles ++
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
                pointing_triples ++
                // console.warn(`---> Useful pointing triple found (${solvedCount} numbers solved to this point): `, pointing_triple, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 4)
                continue
            }

            //6. (remover)
            const hidden_pair = handler.#findHiddenPairs(grid, possibilities_grid)
            if (hidden_pair) {
                console.warn(hidden_pair)
                hidden_pairs ++
                possibilities_grid = Utils.cleanHiddenPair(possibilities_grid, hidden_pair)
                solvingStrategy = Math.max(solvingStrategy, 6)
                continue
            }

            //7. (remover) If still stuck we look for X-wing pairs.
            const x_wing_pair = handler.#findXWingPairs(grid, possibilities_grid)
            if (x_wing_pair) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, x_wing_pair)
                if (updated_possibilities.ammount_removed === 0) break
                x_wing_pairs ++
                console.warn(`---> Useful X-wing pair found (${solvedCount} numbers solved to this point): `, x_wing_pair, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 6)
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

            if (solvingStrategy >= 1) difficulty = 2 //normal
            if (solvingStrategy >= 3) difficulty = 3 //hard
            if (solvingStrategy >= 5) difficulty = 4 //Expert

            if (totalEmpty > 14 && totalEmpty <= 25) difficulty = 0 //novice
            if (totalEmpty > 25 && totalEmpty <= 35) difficulty = 1 //easy
        } else {
            // if (naked_pairs) console.log(`---> Grid status(${solvedCount} / ${totalEmpty}): `, JSON.stringify(grid), JSON.stringify(possibilities_grid))
        }

        // if (naked_pairs) console.log('---> Difficulty determined:', difficulty, solvingStrategy, "removed numbers: ", removed_numbers, "solved numbers: ", solvedCount, "total empty: ", totalEmpty, ` Naked singles: ${naked_singles}, Hidden singles: ${hidden_singles}, Naked pairs: ${naked_pairs}, Pointing groups: ${pointing_triple}`)
        return {difficulty, solvingStrategy, strategies_used: {naked_singles, hidden_singles, naked_pairs, pointing_singles, pointing_triples, hidden_pairs, x_wing_pairs}}
    }
}

module.exports = DifficultyHandler