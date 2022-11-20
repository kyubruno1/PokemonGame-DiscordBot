const { ActionRowBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');
//core modules
const fs = require('fs');
const path = require('path');

//external modules
const config = require('config');
const configRates = config.get('catchRate');
const configPokemonLimit = config.get('samePokemonLimit');
const configPokeballRate = config.get('pokeballRate');
const configInteractionCooldown = config.get('cooldowns.interacaoBotoes');
const earnedCatchChanceByTrainerLevel = config.get('earnedCatchChanceByTrainerLevel');
var chance = require('chance').Chance();
const fetch = require('node-fetch');

//functions & models
const Player = require('../db/models/Player');
const Inventory = require('../db/models/Inventory');
const { checkTrainerLevelUp } = require('../controllers/PlayerController');

/* */

function selectMenuCollector(interaction, row) {
  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.SelectMenu,
    time: configInteractionCooldown,
  });

  collector.on('collect', async (i) => {
    row.components.forEach((item) => item.setDisabled(true));

    await interaction.editReply({ components: [row] });
  });
  collector.on('end', async (i) => {
    row.components.forEach((item) => item.setDisabled(true));
    interaction.editReply({ content: 'Acabou o tempo!', components: [row] });
  });
}

async function createPokeballSelectMenu(interaction) {
  const inventory = await Inventory.findOne({
    where: { PlayerDiscordId: interaction.user.id },
  });
  const json = await inventory.toJSON();

  //passa os valores para a próxima interação
  const growthRate = [
    { name: 'Muito lento', rate: 0.5 },
    { name: 'Lento', rate: 0.8 },
    { name: 'Normal', rate: 1 },
    { name: 'Rápido', rate: 1.5 },
    { name: 'Muito rápido', rate: 2 },
  ];

  const rate = growthRate.find((element) => element.name == interaction.message.embeds[0].fields[5].value);

  //lê arquivo da tabela de exp
  const dataPath = path.join(__dirname, '..', 'assets', 'data', `exp_table.json`);
  const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
  const expData = JSON.parse(data);

  const nextLevelExp = expData.find((item) => item.lvl == interaction.message.embeds[0].fields[3].value);

  let values = {
    pokedexId: interaction.message.embeds[0].fields[2].value,
    name: interaction.message.embeds[0].fields[1].value,
    level: interaction.message.embeds[0].fields[3].value,
    shiny: interaction.message.embeds[0].fields[4].value,
    growth: interaction.message.embeds[0].fields[5].value,
    growthRate: rate.rate,
    element: interaction.message.embeds[0].fields[6].value,
    expToNextLevel: nextLevelExp.expToNextLevel,
    berries: {
      max: interaction.message.embeds[0].fields[9].value,
      equiped: [],
    },
  };

  let options = [];
  for (const [key, val] of Object.entries(json)) {
    if (key.endsWith('ball') && val > 0) {
      options.push({
        label: `${key}`,
        description: `Você possui: ${val} un.`,
        value: `${values.name},${values.level},${values.shiny},${values.growth},${values.growthRate},${values.element},${values.expToNextLevel},${values.berries.max},${values.pokedexId},${key},${interaction.message.embeds[0].fields[8].value}`,
      });
    }
  }

  const row = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId('pokeballSelection')
      .setPlaceholder('Escolha um tipo de pokebola')
      .addOptions(options)
  );

  selectMenuCollector(interaction, row);
  return row;
}

function catchPercentage(pokemonLevel) {
  let porcentagem = configRates.basePercentage;
  let taxa = configRates.rates[0]['0'];
  let level = 0;

  while (level < pokemonLevel) {
    switch (level) {
      case 10:
        taxa = configRates.rates[1]['10'];
        break;
      case 20:
        taxa = configRates.rates[2]['20'];
        break;
      case 30:
        taxa = configRates.rates[3]['30'];
        break;
      case 40:
        taxa = configRates.rates[4]['40'];
        break;
      case 50:
        taxa = configRates.rates[5]['50'];
        break;
      case 60:
        taxa = configRates.rates[6]['60'];
        break;
      case 70:
        taxa = configRates.rates[7]['70'];
        break;
      case 80:
        taxa = configRates.rates[8]['80'];
        break;
      case 90:
        taxa = configRates.rates[9]['90'];
        break;
      case 100:
        break;
    }
    porcentagem = porcentagem - taxa;
    level++;
  }

  return porcentagem;
}

async function catchExecute(interaction) {
  //
  const player = await Player.findOne({ where: { discordId: interaction.user.id } });

  //
  const values = interaction.values[0].split(',');
  const pokeballChose = values[9];
  let catchChance = '';

  for (const [key, val] of Object.entries(configPokeballRate)) {
    if (key == pokeballChose) {
      const trainerBonusChance = player.trainerLevel * earnedCatchChanceByTrainerLevel;
      catchChance = catchPercentage(values[1]) * val;
      catchChance = catchChance + trainerBonusChance;
    }
  }

  //atualiza pokebolas
  await Inventory.decrement({ [pokeballChose]: 1 }, { where: { PlayerDiscordId: interaction.user.id } });

  //verifica se capturou o pokemon
  if (chance.integer({ min: 1, max: 100 }) <= catchChance) {
    // const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    const pokemons = JSON.parse(player.pokemons);
    const pokemonFound = pokemons.find((poke) => poke.id == values[8]);

    //verifica se já ultrapassou o limite de pokemons do mesmo tipo
    if (pokemonFound.slots.length >= configPokemonLimit) {
      return await interaction.reply({
        content: `Você pode ter até ${configPokemonLimit} deste pokemon e você já atingiu o limite. Você pode transformar (/fabrica) seus pokemons em berries ou soltar (/soltar) eles.`,
        ephemeral: true,
      });
    }

    pokemonFound.slots.push({
      name: values[0],
      level: values[1],
      shiny: values[2],
      growth: values[3],
      growthRate: values[4],
      element: values[5],
      expToNextLevel: values[6],
      berries: [
        {
          max: values[7],
          equiped: [],
        },
      ],
    });

    const pokemonBaseExp = values[10] / values[1];
    const playerLevelUp = await checkTrainerLevelUp(player, pokemonBaseExp);

    await Player.update(
      { trainerLevel: playerLevelUp.trainerLevel, expToNextLevel: playerLevelUp.expToNextLevel, pokemons: pokemons },
      { where: { discordId: interaction.user.id } }
    );

    if (playerLevelUp.trainerLevel > player.trainerLevel) {
      return await interaction.reply({
        content: `${interaction.user} capturou um **${values[0]}** level **${values[1]}**, parabéns! 
        Seu nível de treinador aumentou para: **${playerLevelUp.trainerLevel}**`,
      });
    }
    return await interaction.reply({
      content: `${interaction.user} capturou um ${values[0]} level ${values[1]}, parabéns!`,
    });
  }

  return await interaction.reply({
    content: 'Pokemon escapou... que pena',
    ephemeral: true,
  });
}

module.exports = { catchPercentage, catchExecute, createPokeballSelectMenu };