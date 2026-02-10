class SudokuUtils {
    static throwRandomNumber(min, max) {
        const pseudoRandom = Math.floor(Math.random() * (max - min))
        // console.log(pseudoRandom)
        return pseudoRandom + min + 1
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }

    /**
     * Allows us to get the posible numbers to be placed at a given location in the grid.
     * @param {*} grid The sudoku grid.
     * @param {*} row The row index.
     * @param {*} col The column index.
     * @returns An array of posible numbers to be placed at the given location.
     */
    static getPossibleValues(grid, row, col) {
        const possible = [true, true, true, true, true, true, true, true, true, true]
        //For quadrant checking.
        const startRow = row - row % 3
        const startCol = col - col % 3
        
        for (let i = 0; i < 9; i++) {
            // Check row, column, and 3x3 box in a SINGLE loop
            if (grid[row][i] !== 0) possible[grid[row][i]] = false;
            if (grid[i][col] !== 0) possible[grid[i][col]] = false;
            
            // Box indexing logic
            const r = startRow + Math.floor(i / 3);
            const c = startCol + (i % 3);
            if (grid[r][c] !== 0) possible[grid[r][c]] = false;
        }
        
        const result = []
        for (let n = 1; n <= 9; n++) {
            if (possible[n]) result.push(n)
        }
        return result
    }

    /**
     * This function assign the number to the selected location.
     * @param {*} number The number to be assigned.
     * @param {*} row The index of the grid array elements, wich represents a row position.
     * @param {*} col The index of the row array elements, wich represents a column position.
     */
    static asignNumber(possibilities_grid, number, row, col, grid) {
        // console.log('---> attempted number:', number, row, col, JSON.stringify(possibilities_grid))
        if (possibilities_grid[row][col].includes(number)) {
            grid[row].splice(col, 1, number)
            return true
        } 
        // console.log('do not fit', posibilities_grid[row][col])
        return false 
    }

    static removeNumber(row, col, grid) {
        grid[row].splice(col, 1, 0)

        return grid
    }

    /** Looks for the cell with the minimum number of posible numbers to try. If the currently checked cell has not posible numbers to try (empty array), then we are at a dead end and we return false to back-track. If it returns null, then the sudoku is solved.
    */
    static findNextCellToTry(grid, posibilities) {
        let min = Infinity
        let best = null
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    let len
                    if (typeof posibilities[i][j] !== 'number') len = posibilities[i][j].length
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
     * This function updates the posibilities grid in order to test puzzle's solvability when removing numbers. 
     * @param {*} grid The sudoku grid.
     */
    static updatePossibilitiesGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (typeof grid[row][col] !== 'number') {
                    grid[row][col] = Utils.getPossibleValues(grid, row, col)
                }
            }
        }
    }

    /** Instead of checking for safety at each random attempted number we keep the posible numbers at each location. So, when we place any number at the sudoku grid we also remove that number from the arrays of posible numbers correspondig the same row, column and quadrant. That way any time we were to attempt a random number that random number would be guaranteed to be safe.
    * @returns An array of objects, each one contains the row and column positions, the number removed and its index within the possibilities array it came from.
    * @param {*} possibilities_grid The possibilities grid to be modified.
    */
    static removeFromPossibilities(possibilities_grid, number, row, col) {
        let changes = []
        // Same 3x3 quadrant posibilities
        const startRow = row - row % 3
        const startCol = col - col % 3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = startRow + i
                const c = startCol + j
                if (possibilities_grid[r][c] === 0) continue
                const index = possibilities_grid[r][c].indexOf(number)
                if (index >= 0) {
                    possibilities_grid[r][c].splice(index, 1)
                    // if (grid[r][c].length === 0) grid[r][c] = 0
                    changes.push({ row: r, col: c, num: number, i: index })
                }
            }
        }

        // Same row posibilities
        for (let n = 0; n < 9; n++) {
            if (possibilities_grid[row][n] === 0) continue
            const index = possibilities_grid[row][n].indexOf(number)
            if (index >= 0) {
                possibilities_grid[row][n].splice(index, 1)
                // if (grid[row][n].length === 0) grid[row][n] = 0
                changes.push({ row: row, col: n, num: number, i: index })
            }
        }
        // Same column posibilities
        for (let n = 0; n < 9; n++) {
            if (possibilities_grid[n][col] === 0) continue
            const index = possibilities_grid[n][col].indexOf(number)
            if (index >= 0) {
                possibilities_grid[n][col].splice(index, 1)
                // if (grid[n][col].length === 0) grid[n][col] = 0
                changes.push({ row: n, col: col, num: number, i: index })
            }
        }

        // This last piece of code prevents us from adding duplicated changes to the changes array. Duplicates happens when cheking for row and columns after quadrant, it is possible that in some cases the given position is aligned with other empty cells (same row or column at the same time as same quadrant). This means, we will be adding changes twice, one at the quadrant check and another at the row or column check.
        const unique_changes = changes.filter((change, index, self) =>
            index === self.findIndex((c) => (
                c.row === change.row && c.col === change.col
            ))
        )

        return {possibilities_grid, changes: unique_changes}
    }

    /**
     * Takes the changes array to revert any removed numbers contained by it. It allows us to re insert the number to the possibilities array to the exact position it came from.
     * @param {*} possibilities_grid
     * @param {*} changes 
     */
    static revertPossibilities(possibilities_grid, changes) {
        for (const { row, col, num, i } of changes) {
            if (possibilities_grid[row][col] === 0) possibilities_grid[row][col] = []
            // console.log('---> Prior to revert',possibilities_grid[row][col], row, col, JSON.stringify(possibilities_grid))
            if (!possibilities_grid[row][col].includes(num)) {
                if (i >= 0 && i <= possibilities_grid[row][col].length) possibilities_grid[row][col].splice(i, 0, num)
                else possibilities_grid[row][col].push(num)
            }
        }

        return {possibilities_grid, changes}
    }

    static checkDuplicateConstraint(constraints, new_constraint) {
        // console.log('---> Constraints for duplicate check:', JSON.stringify(constraints))
        // We iterate manually to control the return flow strictly
        for (const c of constraints) {
            // 1. Fast fail: If types don't match, it's not the same.
            if (c.location !== new_constraint.location) continue;

            // 2. Deep Compare: Check the actual NUMBERS inside the arrays.
            // We assume 2 values per pair.
            const sameRows = c.rows.includes(new_constraint.rows[0]) && c.rows.includes(new_constraint.rows[1])
            const sameCols = c.cols.includes(new_constraint.cols[0]) && c.cols.includes(new_constraint.cols[1])

            // For values, we sort them to ensure [1,2] is treated the same as [2,1]
            const v1 = [...c.values].sort();
            const v2 = [...new_constraint.values].sort();
            const sameValues = v1[0] === v2[0] && v1[1] === v2[1];

            // 3. If everything matches, it is a duplicate.
            if (sameRows && sameCols && sameValues) {
                return true
            }
        }
        // If we checked everyone and found no match, it is new.
        return false
    }

    // Specific logic for puzzle creation

    static updatePossibilitiesForPuzzleCreation(removed_number, position, possibilities_grid) {

    }

    static removeConstraintsFromPossibilities(possibilities_grid, constraint) {
        console.log('---> Possibilities: ', JSON.stringify(possibilities_grid))
        console.log('---> Constraint to remove from possibilities: ', JSON.stringify(constraint))
        const row = constraint.p1.row
        const row2 = constraint.p2.row
        const col = constraint.p1.col
        const col2 = constraint.p2.col
        switch (constraint.location) {
            case 'row':
                for (let c = 0; c < 9; c++) {
                    if (Array.isArray(possibilities_grid[row][c])) {
                        console.log(`---> Possibilites for position (${row}, ${c}) :`, possibilities_grid[row][c])
                        const index1 = possibilities_grid[row][c].indexOf(constraint.values[0])
                        if (index1 >= 0 && c !== col && c !== col2) possibilities_grid[row][c].splice(index1, 1)
                        const index2 = possibilities_grid[row][c].indexOf(constraint.values[1])
                        if (index2 >= 0 && c !== col && c !== col2) possibilities_grid[row][c].splice(index2, 1)
                        console.log(index1, index2)
                    }
                }
                break
            case 'col':
                for (let r = 0; r < 9; r++) {
                    if (Array.isArray(possibilities_grid[r][col])) {
                        console.log(`---> Possibilites for position (${r}, ${col}) :`, possibilities_grid[r][col])
                        const index1 = possibilities_grid[r][col].indexOf(constraint.values[0])
                        if (index1 >= 0 && r !== row && r !== row2) possibilities_grid[r][col].splice(index1, 1)
                        const index2 = possibilities_grid[r][col].indexOf(constraint.values[1])
                        if (index2 >= 0 && r !== row && r !== row2) possibilities_grid[r][col].splice(index2, 1)
                        console.log(index1, index2)
                    }
                }
                break
            case 'quadrant':
                const row_start = row - (row % 3)
                const col_start = col - (col % 3)
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const r2 = r + row_start
                        const c2 = c + col_start
                        if (Array.isArray(possibilities_grid[r2][c2])) {
                            console.log(`---> Possibilites for position (${r2}, ${c2}) :`, possibilities_grid[r2][c2])
                            const index1 = possibilities_grid[r2][c2].indexOf(constraint.values[0])
                            if (index1 >= 0 && (r2 !== row || c2 !== col) && (r2 !== row2 || c2 !== col2)) possibilities_grid[r2][c2].splice(index1, 1)
                            const index2 = possibilities_grid[r2][c2].indexOf(constraint.values[1])
                            if (index2 >= 0 && (r2 !== row || c2 !== col) && (r2 !== row2 || c2 !== col2)) possibilities_grid[r2][c2].splice(index2, 1)
                        }
                    }
                }
                break
        }

        console.log('---> Updated possibilities: ', JSON.stringify(possibilities_grid))
        return possibilities_grid
    }
}

module.exports = SudokuUtils