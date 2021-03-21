const { Timestamp } = require("mongodb");

const calculate = (total, tips = 0.3) => totaltips = total + (total * tips);
const farnhitToClesius = (farnhit) => celsious = (farnhit - 32) / 1.8;
const clesiousToFarnhit = (clesious) => farnhit = (clesious * 1.8) + 32;

const add = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(a < 0 || b < 0) {
                return reject('the values must be non-negative');
            }

            
            resolve(a + b);
        }, 2000);
    })
}


module.exports = {
    calculate,
    farnhitToClesius,
    clesiousToFarnhit,
    add
}
