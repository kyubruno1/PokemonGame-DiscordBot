const fs = require('fs');
const https = require('https');
const path = require('path');
const fetch = require('node-fetch');

// const dataPath = path.join(__dirname, 'data', `pokemon_infos.json`);
// const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
// const pokemonData = JSON.parse(data);

// console.log(pokemonData);
//898
(async () => {
  for (i = 900; i <= 905; i++) {
    const result = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`);
    const pokemon = await result.json();

    const pokemonImage = pokemon.sprites.other.home.front_default;
    const pokemonShinyImage = pokemon.sprites.other.home.front_shiny;
    // const pokemonArtWork = pokemon.sprites.other.
    // console.log(pokemon);

    // URL of the image
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i}.png`;

    // https.get(pokemonImage, (res) => {
    //   // Image will be stored at this path
    //   const path = `${__dirname}/images/pokemons/${pokemon.name}.png`;
    //   const filePath = fs.createWriteStream(path);
    //   res.pipe(filePath);
    //   filePath.on('finish', () => {
    //     filePath.close();
    //     console.log(`Download Completed, ${i}, ${pokemon.name}`);
    //   });
    // });

    // https.get(pokemonShinyImage, (res) => {
    //   // Image will be stored at this path
    //   const path = `${__dirname}/images/pokemons/${pokemon.name}_shiny.png`;
    //   const filePath = fs.createWriteStream(path);
    //   res.pipe(filePath);
    //   filePath.on('finish', () => {
    //     filePath.close();
    //     console.log(`Download Completed Shiny, ${i}, ${pokemon.name}`);
    //   });
    // });

    https.get(url, (res) => {
      // Image will be stored at this path
      const path = `${__dirname}/images/pokemons/${pokemon.name}.png`;
      const filePath = fs.createWriteStream(path);
      res.pipe(filePath);
      filePath.on('finish', () => {
        filePath.close();
        console.log(`Download Completed , ${i}, ${pokemon.name}`);
      });
    });
  }
})();
