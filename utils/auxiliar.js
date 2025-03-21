class Auxiliar {
    constructor () {
    }

    throwRandom (cell_probabilities) {
        const keys = Object.keys(cell_probabilities);
        const aux = {};
        const random = Math.random();
        let cummulativeP = 0;
        let probabilitiesSum = 0;
    
        for (let key of keys) {
            if (cell_probabilities[key] != '0') {
                aux[key] = eval(cell_probabilities[key]);
                probabilitiesSum += eval(cell_probabilities[key])
            }
        }
        if (Object.keys(aux).length == 0) {
            // return new Error('There are no numbers to choose')
            return 0
        }

        console.log('control' , aux , probabilitiesSum , random);

        if (probabilitiesSum === 0) {
            // return new Error('None of the numbers is electible')
            return 0
        } else {
            const auxKeys = Object.keys(aux);
            for (let key of auxKeys) {
                cummulativeP += aux[key];
                if (random < cummulativeP) {
                    console.log(key);
                    return key
                }
            }
            // return new Error('Not able to pick a value')
            return 0
        };
    }

    numberPosibilities () {
        const numbers = [1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9];
        let allPosibilities = {};

        for (let number of numbers) {
            allPosibilities[number] = '1/9'
        }

        return allPosibilities
    }

    factorial (n) {
        if (n > 1) {
            return (n * this.factorial(n-1))
        } else {
            return 1
        }
    }

    sudokuCells () {
        const rows = ['A' , 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H' , 'I'];
        const columns = [1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9];

    }
}

module.exports = Auxiliar