const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const fetch = require('node-fetch');
const config = require('config');
const pokemonQnt = config.get('pokemonsByGen.generations');

const filePath = path.join(__dirname, 'data', 'pokemon_info.json');
// const helperPath = path.join(__dirname, 'data', 'helper.json');

async function getElementsInfos(filePath) {
  console.log(chalk.bgBlackBright('Criando arquivo de infos sobre pokémons...'));
  try {
  } catch (error) {
    console.log(error);
  }
}

getElementsInfos(filePath);
