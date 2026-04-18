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

        return null
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
    #findNakedPair(grid, possibilities_grid, useless_naked_pairs) {
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
                        
                        if (useless_naked_pairs && Utils.checkUselessPoints(useless_naked_pairs, candidateConstraint, "naked_pairs")) continue
                        return { p1, p2, values: p1.values, location }
                    }
                }
            }
        }
        return null
    }

    /**
     * Pointing Pairs/Triples. If all position candidates for a number in a quadrant are restricted to a single row or column, that number can be removed from the rest of that row or column outside the quadrant.
     */
    #findPointingTriples(grid, possibilities_grid, useless_pointing_triples) {
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

            if (possibleCells.length === 3) { // Here's something to improve, check it later.
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
                    // console.log('---> Candidate pointing triple found: ', constraint)
                                        
                    if (useless_pointing_triples && Utils.checkUselessPoints(useless_pointing_triples, constraint, "pointing_triples")) continue
                    return constraint
                }
            }
        }
        return null
    }

    /**
     * Naked Triples. If there is a set of three cells within a position unit (row, column or quadrant) that shares between only three possible values and each cell having 2 or 3 values, then it is a naked triple.
     */
    #findNakedTriples(possibilities_grid, useless_naked_triples) {
        const units = Utils.getAllUnits()

        for (const unit of units) {
            const candidates = []
            unit.forEach(position => {
                const values = possibilities_grid[position.row][position.col]
                // We are only interested in cells with 2 or 3 values.
                if (Array.isArray(values) && values.length <= 3 && values.length >= 2) {
                    candidates.push(position)
                }
            })

            if (candidates.length < 3) continue
            // console.log(candidates)

            // We will try each combination of 3 candidates to look for the ones that actually shares 3 values.
            for (let x = 0; x < candidates.length; x++) {
                for (let y = x + 1; y < candidates.length; y++) {
                    for (let z = y + 1; z < candidates.length; z++) {
                        const values1 = this.#getPossibleValues(candidates[x].row, candidates[x].col, possibilities_grid)
                        const values2 = this.#getPossibleValues(candidates[y].row, candidates[y].col, possibilities_grid)
                        const values3 = this.#getPossibleValues(candidates[z].row, candidates[z].col, possibilities_grid)
                        const merged_values = new Set()
                        values1.forEach(value => merged_values.add(value))
                        values2.forEach(value => merged_values.add(value))
                        values3.forEach(value => merged_values.add(value))

                        if (merged_values.size !== 3) continue
                        const provisional_triplet = [candidates[x], candidates[y], candidates[z]]
                        // console.log(merged_values, provisional_triplet)

                        const rows = new Set()
                        provisional_triplet.forEach(cell => rows.add(cell.row))
                        const cols = new Set()
                        provisional_triplet.forEach(cell => cols.add(cell.col))
                        const quadrants = new Set()
                        provisional_triplet.forEach(cell => quadrants.add(Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3)))
                        
                        const same_rows = rows.size === 1
                        const same_cols = cols.size === 1
                        const same_quadrants = quadrants.size === 1 

                        const location = []
                        if (same_rows) location.push('row')
                        if (same_cols) location.push('col')
                        if (same_quadrants) location.push('quadrant')

                        const constraint = {
                            p1: provisional_triplet[0],
                            p2: provisional_triplet[1],
                            p3: provisional_triplet[2],
                            values: Array.from(merged_values),
                            location
                        }

                        if (useless_naked_triples && Utils.checkUselessPoints(useless_naked_triples, constraint, "naked_triples")) continue

                        return constraint
                    }
                }
            }
        }

        return null
    }

    /**
     * This functions looks for groups of 2 or 3 cells within a box and row or column that all contain the same candidate. If so, that candidate can be removed from the rest of that row or column outside the box.
     * @param {*} grid 
     * @param {*} possibilities_grid 
     * @returns 
     */
    #findPointingSingles(grid, possibilities_grid, useless_pointing_singles) {
        // Check by quadrants
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
                            if (values.includes(num)) possibleCells.push({ row: r, col: c, values:[num] }) // Here we set the values to be just the selected num because we are looking for cells with that number in common.
                        }
                    }
                }
    
                if (possibleCells.length >= 2 && possibleCells.length <= 3) {
                    const values = Array.from(new Set(possibleCells.map(cell => cell.values).flat()))
                    if (values.length > 1) continue // We double check if we're focusing on the value of interest.
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
                        
                        if (useless_pointing_singles && Utils.checkUselessPoints(useless_pointing_singles, constraint, "pointing_singles")) continue
                        return constraint
                    }
                }
            }
        }

        return null
    }

    /**
     * This logic will look for two cells with the same two values located at the same row, column, or quadrant. If so, it will reveal them as naked pairs. This is, we will clean other possible values of that cells untill only two values are left. Then we can find the pair as naked by #findNakedPairs.
     * @param {*} possibilities_grid 
     */
    #findHiddenPairs(possibilities_grid) {
        //By rows
        for (let r = 0; r < 9; r ++) {
            // We first produce a counter object wich will contain the number of apparitions of every value and an array of the positions it appears in.
            const counter = {}
            for (let n = 1; n < 10; n++) {
                for (let j = 0; j < 9; j ++) {
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

            // We now compare the values' appeareances until we found two of them with two appeareances. If so, we check if they share the same two positions and in that case we return the hidden pair.
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
                                if (this.#getPossibleValues(positions1[0].row, positions1[0].col, possibilities_grid).length > 2 || this.#getPossibleValues(positions2[1].row, positions2[1].col, possibilities_grid).length > 2) {
                                    // console.log('row hidden pair')
                                    const candidate_constraint = {
                                        p1: {row: positions1[0].row, col: positions1[0].col},
                                        p2: {row: positions2[1].row, col: positions2[1].col},
                                        values: [parseInt(keys[i]), parseInt(keys[j])]
                                    }

                                    return candidate_constraint
                                }
                            }
                        }
                    }
                }
            }
        }

        // By columns
        for (let c = 0; c < 9; c ++) {
            const counter = {}
            for (let n = 1; n < 10; n++) {
                for (let i = 0; i < 9; i ++) {
                    if (Array.isArray(possibilities_grid[i][c]) && this.#getPossibleValues(i, c, possibilities_grid).includes(n)) {
                        if (!counter[n]) 
                                counter[n] = {
                                count: 1,
                                positions: [{row: i, col: c}]
                            }
                        else {
                            counter[n].count ++,
                            counter[n].positions.push({row: i, col: c})
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
                            if (positions1[0].row === positions2[0].row && positions1[1].row === positions2[1].row) {
                                if (this.#getPossibleValues(positions1[0].row, positions1[0].col, possibilities_grid).length > 2 || this.#getPossibleValues(positions2[1].row, positions2[1].col, possibilities_grid).length > 2) {
                                    // console.log('column hidden pair')
                                    const candidate_constraint = {
                                        p1: {row: positions1[0].row, col: positions1[0].col},
                                        p2: {row: positions2[1].row, col: positions2[1].col},
                                        values: [parseInt(keys[i]), parseInt(keys[j])]
                                    }

                                    return candidate_constraint
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // By quadrants
        for (let q = 0; q < 9; q ++) {
            const counter = {}
            for (let n = 1; n < 10; n++) {
                for (let m = 0; m < 9; m ++) {
                    const r = Math.floor(m/3) + (Math.floor(q/3) * 3)
                    const c = ((q%3) * 3) + (m%3)
                    if (Array.isArray(possibilities_grid[r][c]) && this.#getPossibleValues(r, c, possibilities_grid).includes(n)) {
                        if (!counter[n]) 
                                counter[n] = {
                                count: 1,
                                positions: [{row: r, col: c}]
                            }
                        else {
                            counter[n].count ++,
                            counter[n].positions.push({row: r, col: c})
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
                            if (positions1[0].row === positions2[0].row && positions1[1].row === positions2[1].row && positions1[0].col === positions2[0].col && positions1[1].col === positions2[1].col) {
                                if (this.#getPossibleValues(positions1[0].row, positions1[0].col, possibilities_grid).length > 2 || this.#getPossibleValues(positions2[1].row, positions2[1].col, possibilities_grid).length > 2) {
                                    // console.log('quadrant hidden pair')
                                    const candidate_constraint = {
                                        p1: {row: positions1[0].row, col: positions1[0].col},
                                        p2: {row: positions2[1].row, col: positions2[1].col},
                                        values: [parseInt(keys[i]), parseInt(keys[j])]
                                    }

                                    return candidate_constraint
                                }
                            }
                        }
                    }
                }
            }
        }

        return null
    }

    /**
     * This funciton will identify groups of three cells belonging to a same position unit (row, column or quadrant) which happens to have three possible values among them that are not present on other cells' values within the same unit. This means that we can delete those values from the other cells' possible values. 
     * @param {*} possibilities_grid 
     * @returns 
     */
    #findHiddenTriples(possibilities_grid) {
        const units = Utils.getAllUnits()

        for (const unit of units) {
            const count = {}
            unit.forEach(position => {
                const values = this.#getPossibleValues(position.row, position.col, possibilities_grid)
                if (Array.isArray(values)) {
                    values.forEach(value => {
                        if (!count[value]) count[value] = []
                        count[value].push({row:position.row, col:position.col})
                    })
                }
            })

            // We filter the keys which represents an array of 2 or 3 postions. This represents values with 2 and 3 appeareances.
            const candidate_keys = Object.keys(count).filter(key => count[key].length >= 2 && count[key].length <= 3)
            if (candidate_keys.length >= 3) {
                // console.log(candidate_keys)
                for (let x = 0; x < candidate_keys.length; x ++) {
                    for (let y = x + 1; y < candidate_keys.length; y++) {
                        for (let z = y + 1; z < candidate_keys.length; z++) {
                            const candidates = []
                            const candidate1 = candidate_keys[x]
                            const candidate2 = candidate_keys[y]
                            const candidate3 = candidate_keys[z]
                            candidates.push(candidate1)
                            candidates.push(candidate2)
                            candidates.push(candidate3)
                            const cell_set = new Set()
                            
                            candidates.forEach(key => {
                                count[key].forEach(position => cell_set.add(`${position.row},${position.col}`))
                            })
                            
                            // We now look for groups of three values which appearances for a set of three cells, wihout repeating non. This means, we found 3 different values, each appearing at least two times within three different cells and exactly three. In other words, we found a hidden triple.
                            if (cell_set.size === 3) {
                                // console.log("Hidden triple found: ", cell_set)
                                const cells = Array.from(cell_set).map(set =>
                                    set.split(',').map(Number)
                                )
                                const triple_values = [Number(candidate1), Number(candidate2), Number(candidate3)]
                                let isUseful = false
                                for (const [r, c] of cells) {
                                    const values = this.#getPossibleValues(r, c, possibilities_grid)
                                    if (values.length > 3 || values.some(value => !triple_values.includes(value))) {
                                        isUseful = true
                                        break
                                    }
                                }

                                const constraint = {
                                    p1: {row: cells[0][0], col: cells[0][1]},
                                    p2: {row: cells[1][0], col: cells[1][1]},
                                    p3: {row: cells[2][0], col: cells[2][1]},
                                    values: triple_values
                                }
                                
                                if (isUseful) return constraint
                            }
                        }
                    }
                }
            }
        }

        return null
    }

    /**
     * This functions looks for a pair of rows or columns with a possible value repeated into two cells equally located inside both rows or columns. If found, then the value can be removed from the alternate coordinate of the row or column it belongs. This is, if i find a pair of cells with the same value and location at two different columns, then, the value can be removed from the rows, not the columns.
     * @param {*} grid 
     * @param {*} possibilities_grid
     * @returns 
     */
    #findXWingPairs(grid, possibilities_grid, useless_x_wing_pairs) {
        for (let num = 1; num <= 9; num++) {

            // By rows
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
                    for (let j = i + 1; j < selectedRows.length; j++) {
                        let matches = 0
                        for (const point of selectedRows[i]) {
                            for (const point2 of selectedRows[j]) {
                                if (point.col === point2.col) matches ++ 
                            }
                        }
                        if (matches === 2) {    
                            // console.log('---> Selected rows for X-wing: ', selectedRows)
                            const candidate_constraint = {
                                p1: selectedRows[i][0], 
                                p2: selectedRows[j][1],
                                p3: null,
                                values: selectedRows[i][0].values, 
                                location: ['x-col']
                            }

                            if (useless_x_wing_pairs && Utils.checkUselessPoints(useless_x_wing_pairs, candidate_constraint, "x_wing_pairs")) continue
                            return candidate_constraint
                        }         
                    }
                }
            }

            // By columns
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
                    for (let j = i + 1; j < selectedCols.length; j++) {
                        let matches = 0
                        for (const point of selectedCols[i]) {
                            for (const point2 of selectedCols[j]) {
                                if (point.row === point2.row) matches ++ 
                            }
                        }
                        if (matches === 2) { 
                            const candidate_constraint = {
                                p1: selectedCols[i][0], 
                                p2: selectedCols[j][1], 
                                p3: null,
                                values: selectedCols[i][0].values, 
                                location: ['x-row']
                            }
                            
                            if (useless_x_wing_pairs && Utils.checkUselessPoints(useless_x_wing_pairs, candidate_constraint, "x_wing_pairs")) continue
                            return candidate_constraint
                        }         
                    }
                }
            }
        }

        // console.log('No x_wing_pairs found')
        return null
    }

    #findYWingPairs(possibilities_grid, useless_y_wing_triples) {
        const bivalueCells = []

        // Gather all cells that have exactly 2 possibilities
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (possibilities_grid[r][c] !== 0) {
                    const values = this.#getPossibleValues(r, c, possibilities_grid)
                    if (values.length === 2) {
                        bivalueCells.push({ row: r, col: c, values })
                    }
                }
            }
        }

        // We will now check if the meet the values' requirements. This is, among groups of three they must have just three possible values.
        if (bivalueCells.length >= 3) {
            // console.log (bivalueCells)
            for (let x = 0; x < bivalueCells.length; x++) {
                for (let y = x + 1; y < bivalueCells.length; y++) {
                    for (let z = y + 1; z < bivalueCells.length; z++) {
                        const merged_values = new Set()
                        const cells = [bivalueCells[x], bivalueCells[y], bivalueCells[z]]
                        cells.forEach(cell => {
                            cell.values.forEach(value => merged_values.add(value))
                        })
                        // We check if each cell share with each other just one value coincidence
                        let coincidences_allowed = true
                        cells.forEach((cell, index) => {
                            const indexes = [0, 1, 2]
                            indexes.splice(index, 1)
                            indexes.forEach(i => {
                                const alt_merged_values = new Set()
                                cell.values.forEach(value => alt_merged_values.add(value))
                                cells[i].values.forEach(value => alt_merged_values.add(value))
                                if (alt_merged_values.size !== 3) coincidences_allowed = false

                                cell.values.forEach(value => {
                                    let matches = 0
                                    cells[i].values.forEach(value2 => {
                                        if (value === value2) matches ++
                                    })
                                    if (matches > 1) coincidences_allowed = false
                                })
                            })
                        })

                        if (merged_values.size !== 3 || !coincidences_allowed) continue
                        // console.log(merged_values)

                        const relations = {}
                        cells.forEach((cell, index) => {
                            const indexes = [0, 1, 2]
                            indexes.splice(index, 1)
                            indexes.forEach(i => {
                                const same_row = cell.row === cells[i].row
                                const same_col = cell.col === cells[i].col
                                const same_quadrant = Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3) === Math.floor(cells[i].row / 3) * 3 + Math.floor(cells[i].col / 3)
                                const key_position = `${cell.row},${cell.col}`
                                if (!relations[key_position]) relations[key_position] = []
                                if (same_row) relations[key_position].push('row')
                                if (same_col) relations[key_position].push('col')
                                if (same_quadrant) relations[key_position].push('quadrant')
                            })

                        })
                        const pivots = []
                        const keys = Object.keys(relations)
                        keys.forEach(key => {
                            if (relations[key].length === 3) pivots.push(key)
                        })
                        if (pivots.length === 1) {
                            // console.log('We have a pivot!: ', pivots, cells)
                            const constraint = {
                                p1: cells[0],
                                p2: cells[1],
                                p3: cells[2],
                                values: Array.from(merged_values),
                                location: [pivots[0]]
                            }

                            if (useless_y_wing_triples && Utils.checkUselessPoints(useless_y_wing_triples, constraint, "y_wing_triples")) continue

                            return constraint
                        }
                    }
                }
            }
        }

        return null
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

        // Solving control variables
        let totalEmpty = grid.flat().filter(v => v === 0).length
        let solvedCount = 0
        let naked_singles = 0
        let hidden_singles = 0
        let naked_pairs = 0
        let naked_triples = 0
        let pointing_singles = 0
        let hidden_pairs = 0
        let hidden_triples = 0
        let x_wing_pairs = 0
        let y_wing_triples = 0

        // Useless points tracing
        let useless_points = {}
        
        // Iteration logic to keep trying to solve the puzzle until no strategies are left to apply. It runs out only when the strategies are over, not when the puzzle is solved. That's how we double check if it is solvable. If this returns undefined then the puzzle is not solvable after all.
        while (true) { 
            // 2. (placer) If step 1 found nothing then we look for Hidden Singles.
            const hidden = handler.#findHiddenSingles(grid, possibilities_grid)
            if (hidden) {
                const {row, col, value} = hidden
                if (grid[row][col] === 0) {
                    const updated_possibilities = Utils.removeFromPossibilities(possibilities_grid, value, row, col) // We update the possibilities grid to keep trying to solve the puzzle with other strategies.
                    // console.log('Found hidden single:', hidden, JSON.stringify(updated_possibilities.possibilities_grid), JSON.stringify(grid), ' possibilities removed: ', updated_possibilities.changes.length)
                    if (updated_possibilities.changes.length === 0) {
                        console.log('Something went wrong, a hidden single is supposed to always give us a change. ', hidden)
                        break
                    }

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
                if (updated_possibilities.changes.length === 0) {
                    console.log('Something went wrong, a naked single is supposed to always give us a change. ', naked_single)
                    break
                }

                grid[row][col] = value
                solvedCount ++
                naked_singles ++
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 2)
                continue // Found something, iterate again to try with updated data.
            }

            //5. (remover) Now we look for pointing singles.
            const pointing_single = handler.#findPointingSingles(grid, possibilities_grid, useless_points['pointing_singles'] ?? null)
            if (pointing_single) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, pointing_single)
                if (updated_possibilities.ammount_removed === 0) {
                    // console.log('---> Useless pointing single found: ', pointing_single)
                    if (useless_points['pointing_singles']) useless_points['pointing_singles'].push(pointing_single)
                    else useless_points['pointing_singles'] = [pointing_single]
                    // console.log(useless_points)
                    continue
                }
                pointing_singles ++
                // console.warn(`---> Useful pointing single found (${solvedCount} numbers solved to this point): `, pointing_single, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 3)
                continue
            }

            // 3. (remover) If stuck we now look for naked pairs. 
            const pair = handler.#findNakedPair(grid, possibilities_grid, useless_points['naked_pairs'] ?? null)
            if (pair) {                
                const updated_possibilites = Utils.removeConstraintsFromPossibilities(possibilities_grid, pair)
                // Double check if progress was made. The first check is at isConstraintUseful inside #findNakedPairs
                if (updated_possibilites.ammount_removed === 0) {
                    // console.log('---> Useless naked pair found: ', pair)
                    if (useless_points['naked_pairs']) useless_points['naked_pairs'].push(pair)
                    else useless_points['naked_pairs'] = [pair]
                    // console.log(useless_points)
                    continue
                }
                // console.warn(`---> Useful naked pair found (${solvedCount} numbers solved to this point): `, new_constraint, JSON.stringify(updated_possibilites.possibilities_grid), JSON.stringify(grid), ' possibilities removed: ', updated_possibilites.ammount_removed)
                naked_pairs ++
                possibilities_grid = updated_possibilites.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 4)
                continue
            }

            //4. (remover) If still stuck we look for pointing pairs/triples.
            const naked_triple = handler.#findNakedTriples(possibilities_grid, useless_points['naked_triples'] ?? null)
            if (naked_triple) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, naked_triple)
                if (updated_possibilities.ammount_removed === 0) {
                    // console.log('---> Useless naked triple found: ', naked_triple)
                    if (useless_points['naked_triples']) useless_points['naked_triples'].push(naked_triple)
                    else useless_points['naked_triples'] = [naked_triple]
                    // console.log(useless_points)
                    continue
                }
                naked_triples ++
                // console.log(`---> Useful pointing triple found (${solvedCount} numbers solved to this point): `, naked_triple, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 5)
                continue
            }

            //7. (remover)
            const hidden_pair = handler.#findHiddenPairs(possibilities_grid)
            if (hidden_pair) {
                // console.warn(hidden_pair)
                hidden_pairs ++
                possibilities_grid = Utils.cleanHiddenPairOrTriple(possibilities_grid, hidden_pair)
                solvingStrategy = Math.max(solvingStrategy, 6)
                continue
            }

            //8. (remover)
            const hidden_triple = handler.#findHiddenTriples(possibilities_grid)
            if (hidden_triple) {
                // console.log(hidden_triple)
                hidden_triples ++
                possibilities_grid = Utils.cleanHiddenPairOrTriple(possibilities_grid, hidden_triple)
                solvingStrategy = Math.max(solvingStrategy, 7)
                continue
            }

            //9. (remover) If still stuck we look for X-wing pairs.
            const x_wing_pair = handler.#findXWingPairs(grid, possibilities_grid, useless_points['x_wing_pairs'] ?? null)
            if (x_wing_pair) {
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, x_wing_pair)
                if (updated_possibilities.ammount_removed === 0) {
                    // console.log('---> Useless X-wing pair found: ', x_wing_pair)
                    if (useless_points['x_wing_pairs']) useless_points['x_wing_pairs'].push(x_wing_pair)
                    else useless_points['x_wing_pairs'] = [x_wing_pair]
                    // console.log(useless_points.x_wing_pairs.length)
                    continue
                }
                x_wing_pairs ++
                // console.warn(`---> Useful X-wing pair found (${solvedCount} numbers solved to this point): `, x_wing_pair, 'possibilities removed: ', updated_possibilities.ammount_removed)
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 8)
                continue
            }

            //10. (remover) Y-wing pairs.
            const y_wing_triple = handler.#findYWingPairs(possibilities_grid, useless_points['y_wing_triples'] ?? null)
            if (y_wing_triple) {
                // console.log(y_wing_triple)
                const updated_possibilities = Utils.removeConstraintsFromPossibilities(possibilities_grid, y_wing_triple)
                if (updated_possibilities.ammount_removed === 0) {
                    if (useless_points['y_wing_triples']) useless_points['y_wing_triples'].push(y_wing_triple)
                    else useless_points['y_wing_triples'] = [y_wing_triple]
                    // console.log(useless_points['y_wing_triples'].length)
                    continue
                }
                y_wing_triples ++
                possibilities_grid = updated_possibilities.possibilities_grid
                solvingStrategy = Math.max(solvingStrategy, 9)
                continue
            }

            // If we reach here, we are stuck (No Singles left)
            // console.log(solvedCount, totalEmpty, JSON.stringify(possibilities_grid))
            break
        }

        const isFullySolved = (solvedCount === totalEmpty)

        if (isFullySolved) {
            // console.log('---> Puzzle fully solved during difficulty evaluation. Final grid: ', JSON.stringify(grid))

            if (solvingStrategy >= 2) difficulty = 2 //normal
            if (solvingStrategy >= 4) difficulty = 3 //hard
            if (solvingStrategy >= 6) difficulty = 4 //Expert

            if (totalEmpty > 14 && totalEmpty <= 25) difficulty = 0 //novice
            if (totalEmpty > 25 && totalEmpty <= 35) difficulty = 1 //easy
        } else {
            // console.log("Stuck during difficulty evaluation. Solved ", solvedCount, " out of ", totalEmpty, " empty cells. Final grid: ", JSON.stringify(grid), "Final possibilities: ", JSON.stringify(possibilities_grid))
        }

        // console.log('---> Difficulty determined:', difficulty, solvingStrategy, "removed numbers: ", removed_numbers, "solved numbers: ", solvedCount, "total empty: ", totalEmpty, `strategies_used: {${naked_singles}, ${hidden_singles}, ${naked_pairs}, ${pointing_singles}, ${pointing_triples}, ${hidden_pairs}, ${x_wing_pairs}}`)
        return {difficulty, solvingStrategy, strategies_used: {naked_singles, hidden_singles, naked_pairs, pointing_singles, naked_triples, hidden_pairs, hidden_triples, x_wing_pairs, y_wing_triples}}
    }
}

module.exports = DifficultyHandler