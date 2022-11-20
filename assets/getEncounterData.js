/*
RODAR ESTE ARQUIVO SOMENTE QUANDO QUISER ATUALIZAR OS ARQUIVOS DE DATA. NÃO RECOMENDADO PORQUE SUBSTUIRÁ O ARQUIVO ATUAL
*/

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const translate = require('@iamtraction/google-translate');

const dataPath = path.join(__dirname, 'data', 'encounter_method.json');

async function getEncounterMethodData() {
  arrUrl = [];
  const result = await fetch(`https://pokeapi.co/api/v2/encounter-method?limit=1000&offset=0`);
  const dataResult = await result.json().then((data) =>
    data.results.forEach((element) => {
      arrUrl.push(element.url);
    })
  );

  //pega as descrições dos encontros
  arrDesc = [];
  for (const url of arrUrl) {
    const result = await fetch(url);
    const data = await result.json();
    if (data.names[1]) {
      console.log(data.names[1].name);
      const translatedString = translate(data.names[1].name, { to: 'pt' })
        .then((res) => {
          let string = res.text;
          return string;
        })
        .catch((err) => {
          console.error(err);
        });
      arrDesc.push(await translatedString);
    } else if (data.names[1] == undefined) {
      const translatedString = translate(data.names[0].name, { to: 'pt' })
        .then((res) => {
          let string = res.text;
          return string;
        })
        .catch((err) => {
          console.error(err);
        });
      arrDesc.push(await translatedString);
    }
  }
  // return arrDesc;
}

async function createFile() {
  const encounter = await getEncounterMethodData();

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(encounter), (err) => {
      if (err) throw err;
    });
  }
}
createFile();
