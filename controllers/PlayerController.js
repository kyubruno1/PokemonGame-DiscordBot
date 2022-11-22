const Player = require('../db/models/Player');
const Inventory = require('../db/models/Inventory');
const fs = require('fs');
const path = require('path');
const config = require('config');
const configPokemons = config.get('universal.pokemonsByGen');
const configPokemonBaseHealth = config.get('universal.pokemonBaseHealth');

async function createAccount(interaction) {
  //sempre vai criar o array com o maior numero de pokemon, para caso queira diminuir a geração depois
  const pQnt = configPokemons.find((gen) => gen.gen == configPokemons[configPokemons.length - 1].gen);

  const pokemons = [];
  for (i = 1; i <= pQnt.quantity; i++) {
    const pokemon = {
      id: i,
      slots: [],
      alreadyCaught: 'No',
    };
    pokemons.push(pokemon);
  }

  const team = [];

  const chosenPokemon = interaction.message.embeds[0].fields;
  const cPoke = {
    name: chosenPokemon[0].value,
    level: chosenPokemon[4].value,
    growth: chosenPokemon[5].value,
    growthRate: 1,
    element: chosenPokemon[2].value,
    expToNextLevel: 100,
    health: configPokemonBaseHealth,
    berries: {
      max: 2,
      equiped: [],
    },
    inTeam: 'Yes',
  };

  const FoundPokemon = pokemons.find((pokemon) => pokemon.id == chosenPokemon[1].value); //acha o pokémon na array
  FoundPokemon.alreadyCaught = 'Yes';

  //adiciona no time
  const newPoke = { ...cPoke }; //copia o objeto sem o novo objeto apontar para a referencia antiga para poder adicionar no time
  newPoke.id = FoundPokemon.id;

  team.push(newPoke);

  FoundPokemon.slots.push(cPoke);

  //procura
  const dataPath = path.join(__dirname, '..', 'assets', 'data', `trainer_exp_table.json`);
  const data = JSON.parse(fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' }));
  const lvlOneExp = data.find((item) => item.trainerLevel == 1);

  await Player.create({
    name: interaction.user.tag,
    discordId: interaction.user.id,
    pokemons: pokemons,
    pvpWins: 0,
    teams: team,
    expToNextLevel: lvlOneExp.expToNextLevel,
  });

  await Inventory.create({ PlayerDiscordId: interaction.user.id });

  return await interaction.reply(
    `${interaction.user} Você escolheu ${chosenPokemon[0].value} como pokemon inicial e recebeu 10 pokebolas para iniciar sua jornada pokémon`
  );
}

async function checkTrainerLevelUp(player, pokemonBaseExp) {
  const diff = player.expToNextLevel - pokemonBaseExp;
  if (diff <= 0) {
    const dataPath = path.join(__dirname, '..', 'assets', 'data', `trainer_exp_table.json`);
    const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
    const expData = JSON.parse(data);

    const trainerLevel = expData.find((item) => item.trainerLevel == +player.trainerLevel + 1);

    player = trainerLevel;
    return checkTrainerLevelUp(player, -diff);
  } else if (diff > 0) {
    player.expToNextLevel = diff;
    // console.log(player);
    return player;
  }
}
module.exports = { createAccount, checkTrainerLevelUp };
