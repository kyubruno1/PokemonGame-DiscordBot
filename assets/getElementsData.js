/*

AS TRADUÇÕES FICAM INCOERENTES COM AS OFICIAIS
O ARQUIVO FICARÁ NO PROJETO PARA FUTUROS UPDATES
CASO ENCONTRE UMA FORMA DE REALIZAR TUDO CERTO

*/

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const fetch = require('node-fetch');
const translate = require('@iamtraction/google-translate');

const filePath = path.join(__dirname, 'data', 'elements.json');

async function getElementsInfos() {
  console.log(chalk.bgBlackBright('Criando arquivo de infos sobre elementos...'));

  let elements = [];
  try {
    const result = await fetch(`https://pokeapi.co/api/v2//type?limit=100000&offset=0`);
    const json = await result.json();

    for (const element of json.results) {
      console.log(element);
      const translated = await translate(element.name, { from: 'en', to: 'pt' });
      const elementInfo = await fetch(element.url);
      const json = await elementInfo.json();

      let strong = [];
      let weak = [];

      json.damage_relations.double_damage_to.forEach((item) => strong.push(item.name));
      json.damage_relations.double_damage_from.forEach((item) => weak.push(item.name));

      elements.push({
        name: element.name,
        strong: strong,
        weak: weak,
      });
    }
    // console.log(elements);
    createFile(helperPath, elements);
  } catch (error) {
    console.log(error);
  }
}

async function createFile(filePath, array) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(array), (err) => {
      if (err) throw err;
    });
  }
  console.log(chalk.bgGreenBright('Criação do arquivo de elementos finalizado.'));
}

getElementsInfos(filePath);
