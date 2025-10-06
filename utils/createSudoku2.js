class Sudoku {
    constructor() {
        this.grid = this.generateEmptyGrid();
    }

    generateEmptyGrid() {
        const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
        return grid
    }

    
    isSafe(grid, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num || grid[x][col] === num) {
                return false;
            }
        }

        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    solveSudoku(grid) {
        let row = -1;
        let col = -1;
        let isFilled = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    row = i;
                    col = j;
                    isFilled = false;
                    break;
                }
            }
            if (!isFilled) {
                break;
            }
        }

        if (isFilled) {
            return true;
        }

        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of numbers) {
            if (this.isSafe(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.solveSudoku(grid)) {
                    return true;
                }
                grid[row][col] = 0;
            }
        }

        return false;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generateSudoku() {
        this.solveSudoku(this.grid);
        return this.grid;
    }

    removeNumbers(grid, count) {
        while (count > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (grid[row][col] !== 0) {
                grid[row][col] = 0;
                count--;
            }
        }
        return grid;
    }

    createSudoku(puzzleCount = 40) {
        this.generateSudoku();
        this.removeNumbers(this.grid, puzzleCount);
        return this.grid;
    }
}

// const sudoku = new Sudoku();
// const puzzle = sudoku.generateSudoku();
// console.log(puzzle);

module.exports = Sudoku;