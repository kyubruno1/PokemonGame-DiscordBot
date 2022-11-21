const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const fetch = require('node-fetch');
const config = require('config');
const generations = config.get('pokemonsByGen.generations');

async function getPokemonData() {
  const filePath = path.join(__dirname, 'data', 'pokemon_info.json');
  const helperPath = path.join(__dirname, 'data', 'helper.json');

  //Arquivo de elementos
  const elementsPath = path.join(__dirname, 'data', 'elements.json');
  const elementsData = JSON.parse(fs.readFileSync(elementsPath, { encoding: 'utf8', flag: 'r' }));
  console.log(elementsData);

  console.log(chalk.bgBlackBright('Criando arquivo de infos sobre pokémons...'));
  try {
    let arr = [];

    //Pega quantas espécies de pokémon existem na API
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species?limit=10000`);
    const json = await res.json();

    //Realiza o loop por todas as espécies e envia para a array
    for (i = 1; i <= json.count; i++) {
      const result = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);
      const pokemon = await result.json();

      const resultElement = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`);
      const elementPokemon = await resultElement.json();

      const element = elementsData.find((item) => item.english == elementPokemon.types[0].type.name);
      const base_experience = elementPokemon.base_experience;

      const infos = {
        id: i,
        name: pokemon.name,
        evolved_from: '',
        evolves_to: '',
        is_legendary: pokemon.is_legendary,
        is_mythical: pokemon.is_mythical,
        element: element.portuguese,
        base_experience: base_experience,
      };

      if (pokemon.evolves_from_species) {
        infos.evolved_from = pokemon.evolves_from_species.name;
      }

      arr.push(infos);
      console.log(infos);

      //Cria o arquivo
      fs.writeFileSync(filePath, JSON.stringify(arr), (err) => {
        if (err) throw err;
      });
    }

    createHelperFile(filePath, helperPath);
  } catch (error) {
    console.log(error);
  }
}

async function createHelperFile(filePath, helperPath) {
  console.log(chalk.bgGreenBright('Arquivo "base" inicial dos pokemons criados'));
  console.log(chalk.bgBlackBright('Criando arquivo helper...'));
  //Cria um arquivo para poder comparar os pokémons depois

  let arr = [];
  try {
    const result = await fetch(`https://pokeapi.co/api/v2/evolution-chain?limit=10000`);
    const json = await result.json();

    for (const item of json.results) {
      const result = await fetch(item.url);

      if (result.status == 200) {
        const pokemon = await result.json();

        const info = {
          base: '',
          e1: '',
          e2: '',
        };

        //Checa se existe o "node" de evolução e preenche o objeto
        if (pokemon.chain.species.name) {
          info.base = pokemon.chain.species.name;
          if (pokemon.chain.evolves_to[0]) {
            info.e1 = pokemon.chain.evolves_to[0].species.name;
            if (pokemon.chain.evolves_to[0].evolves_to[0]) {
              info.e2 = pokemon.chain.evolves_to[0].evolves_to[0].species.name;
            }
          }
        }

        // console.log(info);
        arr.push(info);
      }
    }

    //Cria um arquivo helper
    fs.writeFileSync(helperPath, JSON.stringify(arr), (err) => {
      if (err) throw err;
    });

    compareFiles(filePath, helperPath);
  } catch (error) {
    console.log(error);
  }
}

async function compareFiles(filePath, helperPath) {
  console.log(chalk.bgGreenBright('Arquivo Helper finalizado'));
  console.log(chalk.bgBlackBright('Comparando arquivos...'));

  // console.log('Comparando arquivos...');

  const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  const helper = fs.readFileSync(helperPath, { encoding: 'utf8', flag: 'r' });

  const dataInfo = await JSON.parse(data);
  const helperInfo = await JSON.parse(helper);
  dataInfo.forEach((item) => {
    const base = helperInfo.find((pokemon) => pokemon.base == item.name);
    const evo = helperInfo.find((pokemon) => pokemon.e1 == item.name);

    if (base) {
      checkIfExist(filePath, base.e1) ? (item.evolves_to = base.e1) : null;
    }

    if (evo) {
      checkIfExist(filePath, evo.e2) ? (item.evolves_to = evo.e2) : null;
    }

    fs.writeFileSync(filePath, JSON.stringify(dataInfo), (err) => {
      if (err) throw err;
    });
    //deleta o arquivo helper
    // fs.unlinkSync(helperPath);
  });
  createDefinitiveFile(filePath, helperPath);
}

function checkIfExist(filePath, pokemonName) {
  const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  const pokemonData = JSON.parse(data);

  if (pokemonData.some((e) => e.name === pokemonName)) {
    return true;
  }
  return false;
}

function createDefinitiveFile(filePath, helperPath) {
  console.log(chalk.bgBlackBright('Finalizando edição do arquivo de informações de pokémon...'));

  const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  const json = JSON.parse(data);

  let arr = [...generations];
  for (const gen of arr) {
    gen.pokemons = [];

    json.forEach((item) => {
      if (gen.pokemons.length < gen.quantity) {
        gen.pokemons.push(item);
      }
    });
  }
  //Cria o arquivo
  fs.writeFileSync(filePath, JSON.stringify(arr), (err) => {
    if (err) throw err;
  });

  //deslink
  fs.unlinkSync(helperPath);

  console.log(chalk.green.bold('Finalizado a criação de arquivo de informações de pokémon.'));
}

module.exports = getPokemonData;
// getPokemonsInfos(filePath);

// createHelperFile(filePath, helperPath);

// compareFiles(filePath, helperPath);

// createDefinitiveFile(filePath);
