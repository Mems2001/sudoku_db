const Utils = require('./sudokuUtils')
class DifficultyHandler {
    /**
     * Allows us to get the posible numbers to be placed at a given location in the grid.
     * @param {*} grid The sudoku grid.
     * @param {*} row The row index.
     * @param {*} col The column index.
     * @returns An array of posible numbers to be placed at the given location.
     */
    #getPossibleValues(grid, row, col, constraints) {
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

        //Apply constraints
        if (!constraints || constraints.length === 0) return Array.from(possible)
        for (const constraint of constraints) {
            let inSameUnit = false
            if (constraint.type === 'row' && row === constraint.rows[0]) inSameUnit = true
            if (constraint.type === 'col' && col === constraint.cols[0]) inSameUnit = true
            if (constraint.type === 'box') {
                const sameBox = (Math.floor(row / 3) === Math.floor(constraint.rows[0] / 3)) && (Math.floor(col / 3) === Math.floor(constraint.cols[0] / 3))
                if (sameBox) inSameUnit = true
            }

            if (inSameUnit) {
                // If this cell is NOT one of the two cells forming the pair, remove the values
                const isPairCell = (row === constraint.rows[0] && col === constraint.cols[0]) || (row === constraint.rows[1] && col === constraint.cols[1])
                if (!isPairCell) {
                    possible.delete(constraint.value[0])
                    possible.delete(constraint.value[1])
                }
            }
        }

        return Array.from(possible)
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
                conditions.max = 30
                conditions.number = Utils.throwRandomNumber(15, 30)
                conditions.ultLogic = 0
                break
            case 1:
                conditions.min = 30
                conditions.max = 45
                conditions.number = Utils.throwRandomNumber(30, 45)
                conditions.ultLogic = 1
                break
            case 2:
                conditions.min = 45
                conditions.max = 50
                conditions.number = Utils.throwRandomNumber(45, 50)
                conditions.ultLogic = 2
                break
            case 3:
                conditions.min = 45
                conditions.max = 52
                conditions.ultLogic = 3
                break
            case 4: 
                conditions.min = 52
                conditions.max = 58
                conditions.ultLogic = 4
                break
            case 5:
                conditions.min = 58
                conditions.max = 54
                conditions.ultLogic = 5
                break
        }

        // console.log(conditions)
        return conditions
    }

    /**
     * Scans the grid for cells that have only one possible value.
     * @param {Array} grid The current 9x9 Sudoku grid.
     * @returns {Array} An array of objects {row, col, value} for every naked single found.
     */
    #findNakedSingles(grid, constraints) {
        const nakedSingles = []

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Only check empty cells
                if (grid[r][c] === 0) {
                    const possibilities = this.#getPossibleValues(grid, r, c, constraints)

                    // If there's only one number that can fit here, it's a Naked Single
                    if (possibilities.length === 1) {
                        nakedSingles.push({
                            row: r,
                            col: c,
                            value: possibilities[0]
                        })
                    }
                }
            }
        }
        // if (nakedSingles.length === 0) return null
        return nakedSingles
    }

    /**
     * A number that can only fit in one spot within a row, column, or box.
     */
    #findHiddenSingles(grid, constraints) {
        for (let num = 1; num <= 9; num++) {
            // Check Rows
            for (let r = 0; r < 9; r++) {
                let possibleCols = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c, constraints).includes(num)) {
                        possibleCols.push(c)
                    }
                }
                if (possibleCols.length === 1) return { row: r, col: possibleCols[0], value: num }
            }

            // Check Columns
            for (let c = 0; c < 9; c++) {
                let possibleRows = []
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c, constraints).includes(num)) {
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
                        if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c, constraints).includes(num)) {
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
    #findNakedPair(grid, constraints) {
        //1. We need a map of all possibilities for all empty cells first
        const possibilitiesMap = []
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    possibilitiesMap.push({ r, c, p: this.#getPossibleValues(grid, r, c, constraints) })
                }
            }
        }

        // 2. Look for two cells in the same row/col/box with the same two numbers
        const pairs = possibilitiesMap.filter(cell => cell.p.length === 2)

        for (let i = 0; i < pairs.length; i++) {
            for (let j = i + 1; j < pairs.length; j++) {
                const p1 = pairs[i]
                const p2 = pairs[j]

                // Check if they have the same numbers
                if (p1.p[0] === p2.p[0] && p1.p[1] === p2.p[1]) {
                    // Check if they share a unit (Row, Col, or Box)
                    const sameRow = p1.r === p2.r
                    const sameCol = p1.c === p2.c
                    const sameBox = (Math.floor(p1.r/3) === Math.floor(p2.r/3)) && 
                    (Math.floor(p1.c/3) === Math.floor(p2.c/3))
                    
                    if (sameRow || sameCol || sameBox) {
                        const type = sameRow ? 'row' : (sameCol ? 'col' : 'box')
                        const candidateConstraint = {
                            rows: [p1.r, p2.r],
                            cols: [p1.c, p2.c],
                            value: p1.p,
                            type: type
                        }
                        
                        if (!Utils.checkDuplicateConstraint(constraints, candidateConstraint)) {
                            // We would now remove p1.p numbers from other cells in that unit. If that removal results in a new Naked Single elsewhere, the logic has progressed.
                            return { p1, p2, type };
                        }
                    }
                }
            }
        }
        return null
    }

    /**
     * Pointing Pairs/Triples (Locked Candidates Type 1). If all candidates for a number in a box are restricted to a single row or column, that number can be removed from the rest of that row or column outside the box.
     */
    #findPointingPairTriple(grid, constraints) {
        for (let b = 0; b < 9; b++) {
            const startR = Math.floor(b / 3) * 3
            const startC = (b % 3) * 3

            for (let num = 1; num <= 9; num++) {
                let possibleCells = []

                // Find where 'num' can go in this box
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        let r = startR + i
                        let c = startC + j
                        if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c, constraints).includes(num)) {
                            possibleCells.push({ r, c })
                        }
                    }
                }

                if (possibleCells.length >= 2 && possibleCells.length <= 3) {
                    const sameRow = possibleCells.every(cell => cell.r === possibleCells[0].r)
                    const sameCol = possibleCells.every(cell => cell.c === possibleCells[0].c)

                    if (sameRow || sameCol) {
                        const type = sameRow ? 'pointing_row' : 'pointing_col'
                        const rowOrCol = sameRow ? possibleCells[0].r : possibleCells[0].c

                        // Check if this actually eliminates anything outside the box. This is crucial to ensure the logic actually "progresses"
                        // if (this.#canEliminateOutsideBox(grid, num, type, rowOrCol, b, constraints)) {
                        //     return {
                        //         type: type,
                        //         value: [num],
                        //         box: b,
                        //         index: rowOrCol
                        //     }
                        // }
                    }
                }
            }
        }
        return null
    }

    /**
     * Simulates a human solver to rate the difficulty.
     * @returns {number} 0: Easy, 1: Medium(Requires hidden singles), 2: Hard (Requires Pairs/Backtracking)
     */
    static getPuzzleDifficulty(mainGrid, removed_numbers, difficulty_conditions) {
        let difficulty
        let solvingStrategy
        const handler = new DifficultyHandler()
        let grid = JSON.parse(JSON.stringify(mainGrid))
        let totalEmpty = grid.flat().filter(v => v === 0).length
        let solvedCount = 0

        // Helper veriable to save forbiden values and their locations.
        let constraints = []

        while (true) {
            let progress = false
            // 1. (placer) Prioritize Naked Singles.
            const singles = handler.#findNakedSingles(grid, constraints)
            if (singles.length > 0) {
                // console.log(singles)
                singles.forEach(s => {
                    if (grid[s.row][s.col] === 0) {
                        grid[s.row][s.col] = s.value
                        solvedCount ++
                        progress = true
                        if (!solvingStrategy) solvingStrategy = 0
                    }
                })
                if (progress) {
                    constraints = [] // Reset constraints because the board changed
                    continue
                }
            }

            // 2. (placer) If stuck, look for Hidden Singles.
            const hidden = handler.#findHiddenSingles(grid, constraints)
            if (hidden) {
                // console.log(hidden)
                grid[hidden.row][hidden.col] = hidden.value
                solvedCount ++
                solvingStrategy = Math.max(solvingStrategy, 1)
                progress = true
                constraints = []
                continue // Found something, then go back to check for new Naked Singles.
            }

            // 3. (remover) If stuck we now look for naked pairs. 
            const pair = handler.#findNakedPair(grid, constraints)
            if (pair) {
                // If a pair is found, it means the puzzle is at least 'Normal' (Level 2)
                solvingStrategy = Math.max(solvingStrategy, 2)
                // Instead of breaking, we add the pair to our "constraints", and try the loop again to see if it creates a new Single to keep solving.
                const newConstraint = {
                    rows: [pair.p1.r, pair.p2.r],
                    cols: [pair.p1.c, pair.p2.c],
                    value: pair.p1.p,
                    type: pair.type
                }

                constraints.push(newConstraint)
                progress = true
                continue
            }

            // If we reach here, we are stuck (No Singles left)
            break
        }

        const isFullySolved = (solvedCount === totalEmpty)

        if (isFullySolved) {
            // console.log('---> fully solved')
            // console.log('--->', removed_numbers, difficulty_conditions, auxDifficulty)
            if (removed_numbers === difficulty_conditions.number) difficulty = 0 //novice
            if ((removed_numbers === difficulty_conditions.number && removed_numbers > 30) || solvingStrategy === 1) difficulty = 1 //easy
            if (removed_numbers === difficulty_conditions.number && solvingStrategy === 2) difficulty = 2 //normal
        }

        // console.log('---> Difficulty determined:', difficulty, removed_numbers)
        return difficulty
    }
}

module.exports = DifficultyHandler