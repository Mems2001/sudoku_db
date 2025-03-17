const Auxiliar = require('./auxiliar');
const auxiliar = new Auxiliar();

class Sudoku {
    #remainingCells

    constructor () {
    }

    sudokuStructure () {
        const rows = ['A' , 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H' , 'I'];
        const columns = [1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9];
        const remainingCells = []

        //Asigning cell probabilities
        for (let row of ['A' , 'B' , 'C']) {
            for (let column of columns) {
                this[`${row.toLowerCase()}${column}`] = auxiliar.numberPosibilities();
                remainingCells.push(`${row.toLowerCase()}${column}`)
            }
        };
        this.#remainingCells = remainingCells;

        //Asigning quadrants structure
        this.quadrants = {
            'Q1' : [],
            'Q2' : [],
            'Q3' : [],
            'Q4' : [],
            'Q5' : [],
            'Q6' : [],
            'Q7' : [],
            'Q8' : [],
            'Q9' : []
        };
        for (let row of rows) {
            for (let column of columns) {
                const rowIndex = rows.indexOf(row);
                const columnIndex = columns.indexOf(column);
                //Q1
                if ((0 <= rowIndex && rowIndex < 3) && (0 <= columnIndex && columnIndex < 3)) {
                    this.quadrants['Q1'].push(`${row.toLowerCase()}${column}`)
                };
                //Q2
                if ((0 <= rowIndex && rowIndex < 3) && (3 <= columnIndex && columnIndex < 6)) {
                    this.quadrants['Q2'].push(`${row.toLowerCase()}${column}`)
                };
                //Q3
                if ((0 <= rowIndex && rowIndex < 3) && (6 <= columnIndex && columnIndex < 9)) {
                    this.quadrants['Q3'].push(`${row.toLowerCase()}${column}`)
                };
                //Q4
                if ((3 <= rowIndex && rowIndex < 6) && (0 <= columnIndex && columnIndex < 3)) {
                    this.quadrants['Q4'].push(`${row.toLowerCase()}${column}`)
                };
                //Q5
                if ((3 <= rowIndex && rowIndex < 6) && (3 <= columnIndex && columnIndex < 6)) {
                    this.quadrants['Q5'].push(`${row.toLowerCase()}${column}`)
                };
                //Q6
                if ((3 <= rowIndex && rowIndex < 6) && (6 <= columnIndex && columnIndex < 9)) {
                    this.quadrants['Q6'].push(`${row.toLowerCase()}${column}`)
                };
                //Q7
                if ((6 <= rowIndex && rowIndex < 9) && (0 <= columnIndex && columnIndex < 3)) {
                    this.quadrants['Q7'].push(`${row.toLowerCase()}${column}`)
                };
                //Q8
                if ((6 <= rowIndex && rowIndex < 9) && (3 <= columnIndex && columnIndex < 6)) {
                    this.quadrants['Q8'].push(`${row.toLowerCase()}${column}`)
                };
                //Q9
                if ((6 <= rowIndex && rowIndex < 9) && (6 <= columnIndex && columnIndex < 9)) {
                    this.quadrants['Q9'].push(`${row.toLowerCase()}${column}`)
                }
            }
        }

        //Asign columns structure
        for (let column of columns) {
            let auxC = []
            for (let row of rows) {
                auxC.push(`${row.toLowerCase()}${column}`)
            }
            this[`${column}`] = auxC
        }

        //Asign rows structure
        for (let row of rows) {
            let auxR = []
            for (let column of columns) {
                auxR.push(`${row.toLowerCase()}${column}`)
            }
            this[`${row}`] = auxR
        }
    }

    reasignProbabilities (cell , value , prob , sudoku) {
        console.log('start reasign' , cell);
        if (prob[value] === undefined) {
            return console.log(`cero probabilities for ${cell}`)
        }
        const denom = Number(prob[value].split('/')[1]);
        const newP = `1/${denom-1}`;
        const numbers = Object.keys(prob);
        const row = cell[0].toUpperCase();
        const column = cell[1];
        const qs = ['Q1' , 'Q2' , 'Q3' , 'Q4' , 'Q5' , 'Q6' , 'Q7' , 'Q8' , 'Q9'];
        let currentQ = undefined;
        for (let q of qs) {
            for (let qCell of sudoku.quadrants[q]) {
                if (cell == qCell) {
                    currentQ = q;
                }
            }
        };
        const actualRow = []
        for (let c of sudoku[row]) {
            let control = false;
            for (let c2 of sudoku.quadrants[currentQ]) {
                if (c == c2) {
                    control = true
                }
            }
            if (!control) {
                actualRow.push(c)
            }
        };
        // console.log( 'rows' , actualRow , sudoku[row])

        this.#remainingCells = sudoku.#remainingCells.filter(e => e != cell);
        // console.log(this.b7);
    }

    createSudoku () {
        const numbers = [1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9];

        //Geneal logic foundation:        
        //Each cell has 9 posible numbers with equal probabilities to appear. Whenever a number appears on the cell that probabilitie will end being splited to the reamining cells.
        //Sudoku's rules stablish the basic logic to determine the previous distribution.
        for (let cell of this.#remainingCells) {
            const newCell = auxiliar.throwRandom(this[cell]);
            this.reasignProbabilities(cell , newCell , this[cell] , this);
            this[cell] = newCell
        }
        // const a1 = auxiliar.throwRandom(this.a1);
        // console.log(a1);
        // console.log(this.reasignProbabilities('a1' , a1 , this.a1 , this.remainingCells , this));
        // const a2 = auxiliar.throwRandom(this.a2);
        // console.log(a2);
        // console.log(this.reasignProbabilities('a2' , a2 , this.a2 , this.remainingCells , this));
    }
}

let test = new Sudoku();
test.sudokuStructure();
// console.log(test.I);
// test.createSudoku();
// console.log("cell" , test.i9)
// console.log("quadrant" , test.quadrants)
// console.log("row" , test.A)
// console.log("column" , test[5])
// console.log('random' , Math.random())

module.exports = Sudoku