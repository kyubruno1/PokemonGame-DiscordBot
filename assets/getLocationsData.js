/*
RODAR ESTE ARQUIVO SOMENTE QUANDO QUISER ATUALIZAR OS ARQUIVOS DE DATA. NÃO RECOMENDADO PORQUE SUBSTUIRÁ O ARQUIVO ATUAL
*/

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const translate = require('@iamtraction/google-translate');

const dataPath = path.join(__dirname, 'data', 'location.json');

async function getEncounterMethodData() {
  arrName = [];
  const result = await fetch(`https://pokeapi.co/api/v2/location?limit=1000&offset=0`);
  const dataResult = await result.json().then((data) =>
    data.results.forEach((element) => {
      let noHyphen = element.name.replaceAll('-', ' ');
      let mtTrade = noHyphen.replaceAll('mt', 'monte');
      arrName.push(mtTrade);
    })
  );

  return arrName;
}

async function translateIt() {
  const array = await getEncounterMethodData();
  const arrayTranslated = [];
  for (item in array) {
    const itemTranslated = translate(array[item], { to: 'pt' })
      .then((res) => {
        let string = res.text;

        string = string.replaceAll('coroa', 'coronet');
        string = string.replaceAll('snowpoint', 'ponto de neve');
        string = string.replaceAll('ruin maniac cave', 'mina do ruimaniaco');
        string = string.replaceAll('verify', 'valor');
        string = string.replaceAll('arruina', 'ruinas');
        string = string.replaceAll('lake', 'lago');
        string = string.replaceAll('fazer', 'kanto');
        string = string.replaceAll('você se torna', 'unova');
        string = string.replaceAll('route', 'rota');

        return string;
      })
      .catch((err) => {
        console.error(err);
      });

    arrayTranslated.push(await itemTranslated);
  }
  return arrayTranslated;
}

async function correctTranslation() {
  let finalArray = [];
  const string = await translateIt();

  function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  function rep(string, n) {
    str = setCharAt(string, n + 1, ' andar');
    return str;
  }

  const stringCorr = string.forEach((item) => {
    let n = item.search(/[0-9]{1}[a-z]{1}/);
    if (n > 0) {
      const floorCorrection = rep(item, n);
      finalArray.push(floorCorrection);
    } else {
      finalArray.push(item);
    }
  });
  return finalArray;
}

async function createFile() {
  const encounter = await correctTranslation();

  if (fs.existsSync(dataPath)) {
    const fileData = JSON.parse(fs.readFileSync(dataPath));
    encounter.forEach((item) => {
      fileData.push(item);
    });

    fs.writeFileSync(dataPath, JSON.stringify(fileData), (err) => {
      // if (err) throw err;
    });
    console.log(`Arquivo atualizado`);
  } else if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(encounter), (err) => {
      if (err) throw err;
    });
    console.log(`Arquivo criado`);
  }
}
createFile();
