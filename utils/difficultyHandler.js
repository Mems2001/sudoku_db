class DifficultyHandler {
    /**
     * Allows us to get the posible numbers to be placed at a given location in the grid.
     * @param {*} grid The sudoku grid.
     * @param {*} row The row index.
     * @param {*} col The column index.
     * @returns An array of posible numbers to be placed at the given location.
     */
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

    /**
     * Scans the grid for cells that have only one possible value.
     * @param {Array} grid The current 9x9 Sudoku grid.
     * @returns {Array} An array of objects {row, col, value} for every naked single found.
     */
    #findNakedSingles(grid) {
        const nakedSingles = [];

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Only check empty cells
                if (grid[r][c] === 0) {
                    const possibilities = this.#getPossibleValues(grid, r, c);

                    // If there's only one number that can fit here, it's a Naked Single
                    if (possibilities.length === 1) {
                        nakedSingles.push({
                            row: r,
                            col: c,
                            value: possibilities[0]
                        });
                    }
                }
            }
        }
        return nakedSingles;
    }

    /**
     * Medium: A number that can only fit in one spot within a row, column, or box.
     */
    #findHiddenSingles(grid) {
        for (let num = 1; num <= 9; num++) {
            // Check Rows
            for (let r = 0; r < 9; r++) {
                let possibleCols = [];
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c).includes(num)) {
                        possibleCols.push(c);
                    }
                }
                if (possibleCols.length === 1) return { row: r, col: possibleCols[0], value: num };
            }

            // Check Columns
            for (let c = 0; c < 9; c++) {
                let possibleRows = [];
                for (let r = 0; r < 9; r++) {
                    if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c).includes(num)) {
                        possibleRows.push(r);
                    }
                }
                if (possibleRows.length === 1) return { row: possibleRows[0], col: c, value: num };
            }

            // Check Boxes
            for (let b = 0; b < 9; b++) {
                let possibleCells = [];
                const startR = Math.floor(b / 3) * 3;
                const startC = (b % 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        let r = startR + i, c = startC + j;
                        if (grid[r][c] === 0 && this.#getPossibleValues(grid, r, c).includes(num)) {
                            possibleCells.push({ r, c });
                        }
                    }
                }
                if (possibleCells.length === 1) return { row: possibleCells[0].r, col: possibleCells[0].c, value: num };
            }
        }
        return null;
    }

    #findNakedPairs() {

    }

    /**
     * Simulates a human solver to rate the difficulty.
     * @returns {number} 0: Easy, 1: Medium, 2: Hard (Requires Pairs/Backtracking)
     */
    static getLogicDifficulty(mainGrid) {
        const handler = new DifficultyHandler()
        let grid = JSON.parse(JSON.stringify(mainGrid));
        let totalEmpty = grid.flat().filter(v => v === 0).length;
        let solvedCount = 0;
        let usedHiddenSingles = false;

        while (true) {
            // 1. Prioritize Naked Singles
            const singles = handler.#findNakedSingles(grid);
            if (singles.length > 0) {
                singles.forEach(s => {
                    grid[s.row][s.col] = s.value;
                    solvedCount++;
                });
                continue; 
            }

            // 2. If stuck, look for Hidden Singles
            const hidden = handler.#findHiddenSingles(grid);
            if (hidden) {
                grid[hidden.row][hidden.col] = hidden.value;
                solvedCount++;
                usedHiddenSingles = true;
                continue; // Found something, go back to check for new Naked Singles
            }

            // If we reach here, we are stuck (No Singles left)
            break;
        }

        const isFullySolved = (solvedCount === totalEmpty);

        if (isFullySolved) {
            return usedHiddenSingles ? 1 : 0; // 0 = Easy, 1 = Medium
        }
        
        return 2; // Hard: Simulated solver got stuck, requires Pairs or guessing.
    }
}

module.exports = DifficultyHandler