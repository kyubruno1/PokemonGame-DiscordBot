const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
let exp = 100;
let expAcc = 0;
let array = [];

function createExpTable() {
  console.log(chalk.bgBlackBright('Criando tabela de exp dos pokémons'));
  for (i = 1; i <= 100; i++) {
    let level = {
      lvl: i,
      expToNextLevel: exp.toFixed(0),
      accumulatedExp: expAcc.toFixed(0),
    };
    if (i <= 10) {
      exp = exp * 1.5;
      expAcc = expAcc + exp;
    }
    if (i > 10 && i <= 20) {
      exp = exp * 1.07;
      expAcc = expAcc + exp;
    }
    if (i > 20 && i <= 50) {
      exp = exp * 1.04;
      expAcc = expAcc + exp;
    }
    if (i > 50 && i < 70) {
      exp = exp * 1.03;
      expAcc = expAcc + exp;
    }
    if (i >= 70 && i < 100) {
      exp = exp * 1.03;
      expAcc = expAcc + exp;
    }
    if (i > 98) {
      exp = 99999999999999999999;
    }
    // console.log(`Level: ${level.lvl} exp: ${level.expToNextLevel}, expAcc: ${level.accumulatedExp}`);
    array.push(level);
  }
  createFile();
}

const expPath = path.join(__dirname, 'data', 'exp_table.json');

async function createFile() {
  if (!fs.existsSync(expPath)) {
    fs.writeFileSync(expPath, JSON.stringify(array), (err) => {
      console.log('criou');
      if (err) throw err;
    });
  }
  console.log(chalk.bgGreenBright('Criação da tabela de exp dos pokemons finalizada.'));
}
// createFile();

module.exports = createExpTable;
