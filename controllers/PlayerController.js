const Player = require('../db/models/Player');
const Inventory = require('../db/models/Inventory');
const fs = require('fs');
const path = require('path');
// const Pokemon = require('../db/models/Pokemon');

const fetch = require('node-fetch');
const config = require('config');
const configGen = config.get('generations.gen');
const configPokemons = config.get('pokemonsByGen.generations');

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
    level: chosenPokemon[2].value,
    growth: chosenPokemon[3].value,
    growthRate: 1,
    element: 'Normal',
    expToNextLevel: 100,
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

  const capsules = [
    {
      fragNormal: 0,
      fragFighting: 0,
      fragFlying: 0,
      fragPoison: 0,
      fragGround: 0,
      fragRock: 0,
      fragBug: 0,
      fragGhost: 0,
      fragSteel: 0,
      fragFire: 0,
      fragWater: 0,
      fragGrass: 0,
      fragPsychic: 0,
      fragIce: 0,
      fragDragon: 0,
      fragDark: 0,
      fragFairy: 0,
      fragElectric: 0,
      fragUnknown: 0,
      fragShadow: 0,
      capsuleNormal: 0,
      capsuleFighting: 0,
      capsuleFlying: 0,
      capsulePoison: 0,
      capsuleGround: 0,
      capsuleRock: 0,
      capsuleBug: 0,
      capsuleGhost: 0,
      capsuleSteel: 0,
      capsuleFire: 0,
      capsuleWater: 0,
      capsuleGrass: 0,
      capsulePsychic: 0,
      capsuleIce: 0,
      capsuleDragon: 0,
      capsuleDark: 0,
      capsuleFairy: 0,
      capsuleElectric: 0,
      capsuleUnknown: 0,
      capsuleShadow: 0,
    },
  ];

  await Player.create({
    name: interaction.user.tag,
    discordId: interaction.user.id,
    gotInitial: true,
    pokemons: pokemons,
    pvpWins: 0,
    teams: team,
    trainerLevel: 1,
    expToNextLevel: 100,
    capsules: capsules,
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
