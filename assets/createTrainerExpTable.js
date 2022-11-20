const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
let exp = 1500;
let expAcc = 0;
let array = [];

const expPath = path.join(__dirname, 'data', 'trainer_exp_table.json');

function createTrainerExpTable() {
  console.log(chalk.bgBlackBright('Criando tabela de exp dos treinadores'));

  for (i = 1; i <= 100; i++) {
    let level = {
      trainerLevel: i,
      expToNextLevel: exp.toFixed(0),
      accumulatedExp: expAcc.toFixed(0),
    };
    if (i <= 10) {
      exp = exp * 1.05;
      expAcc = expAcc + exp;
    }

    if (i > 10 && i <= 20) {
      exp = exp * 1.08;
      expAcc = expAcc + exp;
    }

    if (i > 20 && i <= 50) {
      exp = exp * 1.04;
      expAcc = expAcc + exp;
    }

    if (i > 50 && i < 70) {
      exp = exp * 1.05;
      expAcc = expAcc + exp;
    }

    if (i >= 70 && i < 100) {
      exp = exp * 1.04;
      expAcc = expAcc + exp;
    }

    if (i > 98) {
      exp = 99999999999999999999;
    }

    // console.log(`Level: ${i} exp: ${exp.toFixed(0)}, expAcc: ${expAcc.toFixed(0)}`);
    array.push(level);
  }
  createFile();
}

async function createFile() {
  if (!fs.existsSync(expPath)) {
    fs.writeFileSync(expPath, JSON.stringify(array), (err) => {
      if (err) throw err;
    });
  }
  console.log(chalk.bgGreenBright('Criação da tabela de exp dos treinadores finalizada.'));
}

module.exports = createTrainerExpTable;
