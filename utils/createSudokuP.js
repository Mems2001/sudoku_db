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
        for (let row of rows) {
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
        console.log(`start reasignation from ${cell}, with value ${value}`);
        const numbers = Object.keys(prob);
        const row = cell[0].toUpperCase();
        const column = cell[1];
        const qs = ['Q1' , 'Q2' , 'Q3' , 'Q4' , 'Q5' , 'Q6' , 'Q7' , 'Q8' , 'Q9'];
        //First we select the cells wich probabilities need to be updated, this is, the intersection bewtween the quadrant, row and column sets where the cell belongs
        let currentQ = undefined;
        for (let q of qs) {
            for (let qCell of sudoku.quadrants[q]) {
                if (cell == qCell) {
                    currentQ = q;
                }
            }
        };
        const actualRow = [];
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
        const actualColumn = [];
        for (let c of sudoku[column]) {
            let control = false;
            for (let c2 of sudoku.quadrants[currentQ]) {
                if (c == c2) {
                    control = true
                }
            }
            if (!control) {
                actualColumn.push(c)
            }
        };
        const cellsToUpdate = [];
        for (let c of sudoku.#remainingCells) {
            for (let c2 of sudoku.quadrants[currentQ]) {
                if (c === c2 && c != cell) {
                    cellsToUpdate.push(c)
                }
            }
            for (let c2 of actualRow) {
                if (c === c2 && c != cell) {
                    cellsToUpdate.push(c)
                }
            }
            for (let c2 of actualColumn) {
                if (c === c2 && c != cell) {
                    cellsToUpdate.push(c)
                }
            }
        }
        // console.log( 'union' , cellsToUpdate);

        //Reassignment
        for (let cellU of cellsToUpdate) {
            let control = 0;
            //First we change the probability of the selected value to 0
            for (let n of numbers) {
                if (n === value) {
                    sudoku[cellU][n] = '0';
                }                
            };

            //Now we count how many numbers have a probability above 0 to set the new probabilities
            for (let n of numbers) {
                const p = sudoku[cellU][n];
                if (p != '0') {
                    control += 1
                }
            };

            //For normal rows we use the control value to set new probabilities
            for (let n of numbers) {
                const p = sudoku[cellU][n];
                if (p != '0') {
                    sudoku[cellU][n] = `1/${control}`
                }
            };
            
            //If we are at the problematic rows of type I then we need special probability calculus
            const problematicRows = ['b' , 'e'];
            const problematicColumns = [7 , 8 , 9];
            const keyRows = ['a' , 'd'];
            const keyCell = `${row.toLowerCase()+(parseInt(cell[1]) + 1)}`;
            // console.log(keyCell);
            let crutialNumbers = [];
            let remainingCrutials = [];
            const avaliableSlots = 7 - cellU[1];
            if (problematicRows.includes(cellU[0]) && (parseInt(cellU[1]) < 7) && (cellU[1] == keyCell[1])) {
                for (let number of problematicColumns) {
                    crutialNumbers.push(`${sudoku[keyRows[problematicRows.indexOf(row.toLowerCase())]+number]}`)
                };
                for (let n of crutialNumbers) {
                    const p = sudoku[keyCell][n];
                    if (p != '0') {
                        remainingCrutials.push(n)
                    }
                };
                console.log(`avaliable slots for ${cellU}:` , avaliableSlots , control , 'Crutial numbers:' , remainingCrutials , remainingCrutials.length);
            };

            //We check if special probability calculus of type I is needed
            if (remainingCrutials.length > 0 && (problematicRows.includes(cellU[0]))) {
                if (remainingCrutials.length == avaliableSlots) {       
                    const crutialP = `1/${remainingCrutials.length}`;
                    console.log('this cell needs special treatment' , remainingCrutials , remainingCrutials.length , crutialP);
                    for (let n of numbers) {
                        if (remainingCrutials.includes(n)) {
                            sudoku[cellU][n] = crutialP
                        } else {
                            sudoku[cellU][n] = '0'
                        }
                    }
                }
            };

            //If we are at the problematic rows of type II then we need special probability calculus
            const problematicRows2 = ['d'];
            const problematicColumns2 = [9];
            const keyRows2 = [['a' , 'b' , 'c']];
            const avaliableSlots2 = 9 - cellU[1];
            if ((problematicRows2.includes(cellU[0])) && (parseInt(cellU[1]) < 9) && (cellU[1] == keyCell[1])) {
                for (let row of keyRows2[problematicRows2.indexOf(cellU[0])] ) {
                    crutialNumbers.push(`${sudoku[row+problematicColumns2[0]]}`)
                };
                for (let n of crutialNumbers) {
                    const p = sudoku[keyCell][n];
                    if (p != '0') {
                        remainingCrutials.push(n)
                    }
                };
                console.log(`avaliable slots for ${cellU}:` , avaliableSlots2 , control , 'Crutial numbers:' , remainingCrutials , remainingCrutials.length);
            };

            //We check if special probability calculus of type II is needed
            if (remainingCrutials.length > 0 && (problematicRows2.includes(cellU[0]))) {
                if (remainingCrutials.length == avaliableSlots2) {       
                    const crutialP = `1/${remainingCrutials.length}`;
                    console.log('this cell needs special treatment' , remainingCrutials , remainingCrutials.length , crutialP);
                    for (let n of numbers) {
                        if (remainingCrutials.includes(n)) {
                            sudoku[cellU][n] = crutialP
                        } else {
                            sudoku[cellU][n] = '0'
                        }
                    }
                }
            };
             
            // let controlP = [];
            // for (let n of numbers) {
            //     controlP.push(sudoku[cellU][n])
            // }
            // console.log(`New p ${cellU}` , controlP)
        }
        
        this.#remainingCells = sudoku.#remainingCells.filter(e => e != cell);
        // console.log(cell , sudoku[cell] , value);
    }

    generateSudoku () {
        const numbers = [1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9];
        const rows = ['A' , 'B' , 'C' , 'D' , 'E'];
        let cells = [];
        for (let row of rows) {
            for (let number of numbers) {
                cells.push(`${row.toLowerCase()}${number}`)
            }
        }

        //Geneal logic foundation:        
        //Each cell has 9 posible numbers with equal probabilities to appear. Whenever a number appears on the cell that probabilitie will end being splited to the reamining cells.
        //Sudoku's rules stablish the basic logic to determine the previous distribution.
        for (let cell of cells) {
            const newCell = auxiliar.throwRandom(this[cell]);
            this.reasignProbabilities(cell , newCell , this[cell] , this);
            this[cell] = newCell
        }
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