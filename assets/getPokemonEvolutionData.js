const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const config = require('config');
const pokemonQnt = config.get('pokemonsByGen.generations');

/*
COMO USAR: Primeiro ativar a função getAllPokemonInfos e rodar o arquivo
            depois descomentar a próxima função e rodar de novo o arquivo
            e por último descomentar a última e rodar
*/

let array = [];
async function getAllPokemonInfos() {
  const expPath = path.join(__dirname, 'assets', 'data', 'pokemon_infos2.json');
  // if (!fs.existsSync(expPath)) {
  for (i = 1; i <= 905; i++) {
    const result = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
    const pokemon = await result.json();

    const pokemonInfo = {
      id: i,
      name: pokemon.name,
      evolved_from: '',
      evolves_to: '',
    };
    if (pokemon.evolves_from_species) {
      pokemonInfo.evolved_from = pokemon.evolves_from_species.name;
    }
    array.push(pokemonInfo);
    console.log(pokemonInfo);
  }

  fs.writeFileSync(expPath, JSON.stringify(array), (err) => {
    if (err) throw err;
  });
  // }
}
// getAllPokemonInfos();

function checkIfExist(pokemonName) {
  const dataPath = path.join(__dirname, 'data', `pokemon_infos2.json`);
  const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
  const pokemonData = JSON.parse(data);

  if (pokemonData.some((e) => e.name === pokemonName)) {
    return true;
  }
  return false;
}

async function checkIfExistBefore() {
  const dataPath = path.join(__dirname, 'data', `pokemon_infos2.json`);
  const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
  const pokemonData = JSON.parse(data);

  pokemonData.forEach((item, index) => {
    if (!checkIfExist(item.evolved_from)) {
      item.evolved_from = '';
    }
  });

  fs.writeFileSync(dataPath, JSON.stringify(pokemonData), (err) => {
    if (err) throw err;
  });
}
// checkIfExistBefore();

let pokearray = [];
async function createHelperFile() {
  const dataPath = path.join(__dirname, 'data', `pokemon_infos.json`);
  const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
  const pokemonData = JSON.parse(data);

  //78 = 1 gen
  //129 = 2 gen
  //202 = 3 gen
  //254 = 4 gen -- NÃO FUNCIONAM: 210, 222, 224, 225, 226, 227, 238, 251
  //336 = 5 gen
  //373 = 6 gen
  //429 = 7 gen
  //476 = 8 gen
  for (i = 429; i <= 476; i++) {
    console.log(i);
    if (i != 210 && i != 222 && i != 224 && i != 225 && i != 226 && i != 227 && i != 231 && i != 238 && i != 251) {
      const result = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${i}/`);
      const pokemon = await result.json();

      const pokeInfo = {
        base: '',
        e1: '',
        e2: '',
      };

      //Checa se existe o "node" de evolução e preenche o objeto
      if (pokemon.chain.species.name) {
        pokeInfo.base = pokemon.chain.species.name;
        if (pokemon.chain.evolves_to[0]) {
          pokeInfo.e1 = pokemon.chain.evolves_to[0].species.name;
          if (pokemon.chain.evolves_to[0].evolves_to[0]) {
            pokeInfo.e2 = pokemon.chain.evolves_to[0].evolves_to[0].species.name;
          }
        }
      }

      pokearray.push(pokeInfo);
    }
  }

  //cria um arquivo helper
  const pokemonEvolutionPath = path.join(__dirname, 'data', 'pokemon_evolution.json');

  if (!fs.existsSync(pokemonEvolutionPath)) {
    fs.writeFileSync(pokemonEvolutionPath, JSON.stringify(pokearray), (err) => {
      if (err) throw err;
    });
  }
}
// createHelperFile();

function verifyPokemon() {
  const dataPath = path.join(__dirname, 'data', `pokemon_infos.json`);
  const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
  const pokemonData = JSON.parse(data);

  const pokemonPath = path.join(__dirname, 'data', `pokemon_evolution.json`);
  const pokemon = fs.readFileSync(pokemonPath, { encoding: 'utf8', flag: 'r' });
  const pokemonEvoData = JSON.parse(pokemon);

  pokemonData.forEach((item, index) => {
    const pokemonFindBase = pokemonEvoData.find((pokemon) => pokemon.base == item.name);
    const pokemonFindEvoOne = pokemonEvoData.find((pokemon) => pokemon.e1 == item.name);
    // const pokemonFindEvoTwo = pokemonEvoData.find((pokemon) => pokemon.e2 == item.name);
    if (pokemonFindBase) {
      if (checkIfExist(pokemonFindBase.e1)) {
        item.evolves_to = pokemonFindBase.e1;
      }
    }
    if (pokemonFindEvoOne) {
      if (checkIfExist(pokemonFindEvoOne.e2)) {
        item.evolves_to = pokemonFindEvoOne.e2;
      }
    }
  });

  // console.log(pokemonData);
  fs.writeFileSync(dataPath, JSON.stringify(pokemonData), (err) => {
    if (err) throw err;
  });

  //deleta o arquivo helper
  fs.unlinkSync(pokemonPath);
}
// verifyPokemon();
(async () => {
  // await getAllPokemonInfos();
  await checkIfExistBefore();
  await createHelperFile();
  verifyPokemon();
})();
