const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  AttachmentBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const chance = require('chance').Chance();
const config = require('config');
const configGen = config.get('universal.generationsPlayed');
const configPokemons = config.get('universal.pokemonsByGen');
const configShinyPercentage = config.get('find.shinySpawnPercentage');
const configPokemonLimit = config.get('universal.samePokemonLimitInPokedex');
const configInteractionCooldown = config.get('universal.cooldowns.buttonInteraction');
const spawnLevelByTrainerLevel = config.get('player.pokemonSpawnLevelByTrainerLevel');
const Canvas = require('@napi-rs/canvas');

const Player = require('../db/models/Player');
const Inventory = require('../db/models/Inventory');

async function generateEvent(interaction) {
  //busca os eventos e gera randomicamente um deles
  const eventsPath = path.join(__dirname, '..', 'assets', 'data', 'events.json');
  const eventFile = JSON.parse(fs.readFileSync(eventsPath, { encoding: 'utf8', flag: 'r' }));

  const eventRandom = Math.floor(Math.random() * eventFile.length);
  const event = eventFile[eventRandom];

  if (event.name == 'gymLeader') {
    const leaders = event.gymLeaders.find((gen) => gen.gen == configGen);
    const eventRandom = Math.floor(Math.random() * leaders.leaders.length);
    const eventLeader = leaders.leaders[eventRandom];

    // busca na pasta do evento uma imagem aleatória
    const imagesFolderPath = path.join(__dirname, '..', 'assets', 'images', 'events', `${event.name}`);
    const imagesFolder = fs.readdirSync(imagesFolderPath);
    const imageFind = imagesFolder.find((image) => image.includes(eventLeader.name));

    //busca a imagem do evento
    const imagePath = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'events',
      `${event.name}`,
      `${imageFind.split('.')[0]}.png`
    );
    // const imageFolders = fs.readFileSync(imagePath);

    //cria imagem
    const canvas = Canvas.createCanvas(250, 250);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage(imagePath);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    const image = new AttachmentBuilder(await canvas.encode('png'), {
      name: `${eventLeader.name}.png`,
    });

    return createEmbedGymLeader(event, eventLeader, image, interaction);
  }

  // busca na pasta do evento uma imagem aleatória
  const imagesFolderPath = path.join(__dirname, '..', 'assets', 'images', 'events', `${event.name}`);
  const imagesFolder = fs.readdirSync(imagesFolderPath);
  const imageFind = imagesFolder.find((image) => image.includes(event.name));

  //busca a imagem do evento
  const imagePath = path.join(
    __dirname,
    '..',
    'assets',
    'images',
    'events',
    `${event.name}`,
    `${imageFind.split('.')[0]}.png`
  );

  //cria imagem
  const canvas = Canvas.createCanvas(350, 350);
  const context = canvas.getContext('2d');
  const background = await Canvas.loadImage(imagePath);
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  const image = new AttachmentBuilder(await canvas.encode('png'), {
    name: `${event.name}.png`,
  });

  return createEmbedEvent(event, image, interaction);
}

async function createEmbedGymLeader(event, eventLeader, image, interaction) {
  const difficulty = chance.pickone(['Facil', 'Medio', 'Dificil']);
  const battleType = chance.pickone(['Jokenpo', 'Campo Minado']);
  let pokemonLvl = 0;

  if (difficulty == 'Facil') {
    pokemonLvl = 30;
  }

  if (difficulty == 'Medio') {
    pokemonLvl = 50;
  }

  if (difficulty == 'Dificil') {
    pokemonLvl = 80;
  }

  const embedGym = new EmbedBuilder()
    .setColor('EE1515')
    .setTitle('Enquanto andava pelo mundo aconteceu algo...')
    .setAuthor({
      name: 'Escolha nos botões abaixo a ação a tomar',
      iconURL: 'https://pngimg.com/uploads/pokeball/pokeball_PNG8.png',
    })
    .setDescription(
      `${event.entryText} ${eventLeader.name}
    ${event.actionText}`
    )
    .addFields(
      { name: 'Nome', value: `${eventLeader.name}`, inline: true },
      { name: 'Tipo Pokemon', value: `${eventLeader.pokemon_type}`, inline: true },
      { name: 'Insignia', value: `${eventLeader.insigne}`, inline: true },
      { name: 'Nv. Pokemons', value: `${pokemonLvl}`, inline: true },
      { name: 'Tipo Batalha', value: `${battleType}`, inline: true },
      { name: 'Dificuldade', value: `${difficulty}`, inline: true },
      { name: 'Liga', value: `${eventLeader.league}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '\u200B', value: '\u200B' }
    )
    .setImage(`attachment://${eventLeader.name}.png`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('battleGym').setLabel('Batalhar').setEmoji('⚔️').setStyle(ButtonStyle.Danger)
  );

  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: configInteractionCooldown,
  });

  collector.on('collect', (i) => {
    if (i.user.id == interaction.user.id) {
      row.components[0].setDisabled(true);
      collector.removeAllListeners();
      interaction.editReply({ components: [row] });
    }
  });

  collector.on('end', (collected, reason) => {
    if (reason == 'time') {
      row.components[0].setDisabled(true);
      interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [row], ephemeral: true });
    }
  });

  return await interaction.reply({
    content: `${interaction.user}`,
    embeds: [embedGym],
    files: [image],
    components: [row],
  });
}

async function createEmbedEvent(event, image, interaction) {
  let desc = `${event.entryText} ${event.actionText}`;

  if (event.name == 'pokemonDied') {
    const action = await pokemonDied(interaction);
    desc = `${desc}\n ${action}`;
  }

  if (event.name == 'rocketTeam' || event.name == 'thief') {
    row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('lost').setLabel('Tchauzinho item').setEmoji('😕').setStyle(ButtonStyle.Primary)
    );

    const action = await lostItems(interaction);
    desc = `${desc}\n\n ${action}`;
  }

  if (event.name == 'lostBackpack') {
    const action = await lostItemsBackpack(interaction);
    desc = `${desc}\n${action}`;
  }

  if (event.name == 'wonLottery') {
    const prize = await lotteryPrize(interaction);

    desc = `${desc}\n\nVocê ganhou **${prize.moedas}** moedas!\nAgora possui: **${
      prize.player.moedas + prize.moedas
    }** moedas`;
  }

  //premiação padrão para professor / enfermeira joy / oficial jenny
  if (event.name == 'nurseJoy' || event.name == 'professor' || event.name == 'officerJenny') {
    const action = await standardPrize(interaction);
    desc = `${desc}\n${action}`;
  }

  //cria o embed
  const embedEvent = new EmbedBuilder()
    .setColor('EE1515')
    .setTitle('Enquanto andava pelo mundo aconteceu algo...')
    .setAuthor({
      name: 'Escolha nos botões abaixo a ação a tomar',
      iconURL: 'https://pngimg.com/uploads/pokeball/pokeball_PNG8.png',
    })
    .setDescription(desc)
    // .addFields({ name: '\u200B', value: '\u200B' })
    .setImage(`attachment://${event.name}.png`)
    .setTimestamp();

  return await interaction.reply({
    content: `${interaction.user}`,
    embeds: [embedEvent],
    files: [image],
    // components: [row],
  });
}

/*************************************************** 
  FUNÇOES RELACIONADAS À PREMIAÇÃO DOS EVENTOS
****************************************************/
async function lotteryPrize(interaction) {
  const moedas = chance.integer({ min: 100, max: 1500 });
  const player = await Inventory.findOne({ where: { PlayerDiscordId: interaction.user.id } });
  await player.increment('moedas', { by: moedas });

  return { player, moedas };

  // return await interaction.reply({
  //   content: `${interaction.user} Você ganhou **${moedas}** moedas!!! Agora possui: **${
  //     player.moedas + moedas
  //   }** moedas no total`,
  // });
}

async function standardPrize(interaction) {
  const player = await Inventory.findOne({ where: { PlayerDiscordId: interaction.user.id } });

  const moedas = chance.integer({ min: 100, max: 300 });
  const pokeball = chance.integer({ min: 1, max: 5 });
  const greatball = chance.integer({ min: 0, max: 1 });

  const moedasUpdate = moedas + player.moedas;
  const pokeballUpdate = pokeball + player.pokeball;
  const greatballUpdate = greatball + player.greatball;

  await player.update({
    moedas: moedasUpdate,
    pokeball: pokeballUpdate,
    greatball: greatballUpdate,
  });

  return `Você ganhou **${moedas}** moedas, **${pokeball}** pokeball, **${greatball}** greatball. 
  Agora possui: **${moedasUpdate}** moedas, **${pokeballUpdate}** pokeball, **${greatballUpdate}** no total`;
}

async function lostItems(interaction) {
  let arr = [];

  const player = await Inventory.findOne({ where: { PlayerDiscordId: interaction.user.id } });
  const playerJSON = player.toJSON();

  Object.keys(playerJSON).forEach((key) => {
    if (key != 'badges' && key != 'PlayerDiscordId' && key != 'id') {
      arr.push({
        key,
        value: playerJSON[key],
      });
    }
  });

  const lostRandom = Math.floor(Math.random() * arr.length);
  const lostItem = arr[lostRandom];

  const decrementItem = Math.round(lostItem.value * 0.9);

  await player.update({ [lostItem.key]: [decrementItem] });

  if (decrementItem == 0) {
    return `Tentou roubar um item que você tem pouca quantidade, então por você ter tão pouco não perdeu nada!`;
  }

  return `Roubou ${lostItem.value - decrementItem} ${lostItem.key}. Você ainda tem ${decrementItem} ${lostItem.key}`;
}

async function lostItemsBackpack(interaction) {
  let arr = [];

  const player = await Inventory.findOne({ where: { PlayerDiscordId: interaction.user.id } });
  const playerJSON = player.toJSON();

  Object.keys(playerJSON).forEach((key) => {
    if (key != 'badges' && key != 'PlayerDiscordId' && key != 'id') {
      arr.push({
        key,
        value: playerJSON[key],
      });
    }
  });

  arr.forEach((item, index) => {
    let round = item.value * 0.5;
    arr[index].value = Math.round(round);
  });

  await player.update({
    [arr[0].key]: [arr[0].value],
    [arr[1].key]: [arr[1].value],
    [arr[2].key]: [arr[2].value],
    [arr[3].key]: [arr[3].value],
    [arr[4].key]: [arr[4].value],
    [arr[5].key]: [arr[5].value],
    [arr[6].key]: [arr[6].value],
  });

  return `**Você ainda tem:** 
  ${arr[0].key}: **${arr[0].value}**,
  ${arr[1].key}: **${arr[1].value}**,
  ${arr[2].key}: **${arr[2].value}**,
  ${arr[3].key}: **${arr[3].value}**,
  ${arr[4].key}: **${arr[4].value}**,
  Item de Evolução 1: **${arr[5].value}**,
  Item de Evolução 2: **${arr[6].value}**`;
}

async function pokemonDied(interaction) {
  const arr = [];
  const player = await Player.findOne({ where: { discordId: interaction.user.id } });
  const pokemons = JSON.parse(player.pokemons);
  const pokemonTeam = JSON.parse(player.teams);

  pokemons.forEach((item) => {
    if (item.slots != '') {
      item.slots.forEach((item) => {
        arr.push(item);
      });
    }
  });

  const lostRandom = Math.floor(Math.random() * arr.length);
  const lostPokemon = arr[lostRandom];
  const pokemonFound = pokemons.find((item) => item.slots.includes(lostPokemon));
  const pokemonFoundTeam = pokemonTeam.find(
    (item) =>
      item.name == lostPokemon.name &&
      item.level == lostPokemon.level &&
      item.growth == lostPokemon.growth &&
      item.growthRate == lostPokemon.growthRate &&
      item.element == lostPokemon.element &&
      item.expToNextLevel == lostPokemon.expToNextLevel
  );
  if (pokemonFoundTeam) {
    const indexOfFoundPokemon = pokemonTeam.indexOf(pokemonFoundTeam);
    const slice = pokemonTeam.splice(indexOfFoundPokemon, 1);
    await player.update({ teams: pokemonTeam });
  }
  if (pokemonFound) {
    const exactFound = pokemonFound.slots.find((item) => item == lostPokemon);
    const indexOfFoundPokemon = pokemonFound.slots.indexOf(exactFound);
    const slice = pokemonFound.slots.splice(indexOfFoundPokemon, 1);
    await player.update({ pokemons: pokemons });
    return `O pokémon que foi ao pokeparaiso foi.. **${slice[0].name}** level **${slice[0].level}**`;
  }
  return `**NENHUM Pokémon morreu... Pois você não tem mais nenhum pokemon...**`;
}

/*************************************************** 
  FUNÇOES RELACIONADAS À CAPTURA DE POKÉMON
****************************************************/
async function getPokemonInfos(interaction) {
  const pokeQnt = configPokemons.find((gen) => gen.gen == configGen);

  const infoPath = path.join(__dirname, '..', 'assets', 'data', 'pokemon_info.json');
  const infoFile = JSON.parse(fs.readFileSync(infoPath, { encoding: 'utf8', flag: 'r' }));
  const findGeneration = infoFile.find((item) => item.gen == configGen);
  const pokemon = findGeneration.pokemons[chance.integer({ min: 0, max: pokeQnt.quantity })];

  // const result = await fetch(`http://pokeapi.co/api/v2/pokemon/${chance.integer({ min: 0, max: pokeQnt.quantity })}/`);
  // const pokemon = await result.json();

  //growth rate
  const growthRate = ['Muito lento', 'Lento', 'Normal', 'Rápido', 'Muito rápido'];
  const growthRandom = Math.floor(Math.random() * growthRate.length);
  const growth = growthRate[growthRandom];

  //berries limit
  const berriesQnt = [0, 1, 2, 3, 4];
  const berriesLimit = berriesQnt[growthRandom];

  //shiny
  const shiny = shinyChance();
  if (shiny == 'Sim') {
    pokemon.name = `${pokemon.name}_shiny`;
  }

  //level
  const player = await Player.findOne({ where: { discordId: interaction.user.id } });

  let maxLevel = spawnLevelByTrainerLevel.base + player.trainerLevel * spawnLevelByTrainerLevel.increaseByLevel;

  if (maxLevel > 100) {
    maxLevel = 100;
  }

  const level = chance.integer({ min: 1, max: maxLevel });

  return { pokemon, growth, shiny, level, berriesLimit };
}

function shinyChance() {
  if (chance.floating({ min: 0, max: 100, fixed: 2 }) <= configShinyPercentage) {
    return 'Sim';
  } else {
    return 'Não';
  }
}

function readAndGetEncounters(fileName) {
  const filePath = path.join(__dirname, '..', 'assets', 'data', `${fileName}.json`);
  let fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  const file = JSON.parse(fileData);
  const fileRandom = Math.floor(Math.random() * file.length);

  return file[fileRandom];
}

function interactionCollector(interaction, row) {
  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: configInteractionCooldown,
  });
  collector.on('collect', async (i) => {
    if (i.user.id === interaction.user.id) {
      if (i.customId === 'catch') {
        row.components.forEach((button) => button.setDisabled(true));
      }
      if (i.customId === 'battle') {
        row.components.forEach((button) => button.setDisabled(true));
      }
      interaction.editReply({ components: [row] });
    }
  });
  collector.on('end', async (i) => {
    row.components.forEach((button) => button.setDisabled(true));
    interaction.editReply({ content: '', components: [row] });
  });
}

async function createEmbedPokemon(interaction, player) {
  //infos pokemon
  const { pokemon, growth, shiny, level, berriesLimit } = await getPokemonInfos(interaction);

  //há slot disponivel para captura?
  const playersPokemons = JSON.parse(player.pokemons);
  const pokemonFound = playersPokemons.find((poke) => poke.id == pokemon.id);
  let canCatch = 'Sim';

  if (pokemonFound.slots.length >= configPokemonLimit) {
    canCatch = 'Não';
  }

  //pega a descrição de local do embed
  const location = await readAndGetEncounters('location');
  const encounter = await readAndGetEncounters('encounter_method');

  //imagem do pokemon
  const pokemonImagePath = path.join(__dirname, '../assets/images/pokemons/');
  const file = new AttachmentBuilder(`${pokemonImagePath}${pokemon.name}.png`);

  // manipulação do nome
  let pokemonName = `${pokemon.name}`.split('_')[0];
  if (shiny == true) {
    pokemonName = `🌟 ${pokemonName}`;
  }

  //cria embed
  const embedPokemon = new EmbedBuilder()
    .setColor('EE1515')
    .setTitle('Encontrou um pokémon')
    .setAuthor({
      name: 'Escolha nos botões abaixo a ação a tomar',
      iconURL: 'https://pngimg.com/uploads/pokeball/pokeball_PNG8.png',
    })
    .setDescription(`Encontrou um ${pokemon.name} em ${location} ${encounter}`)
    .addFields(
      { name: '\u200B', value: '\u200B' },
      { name: 'Nome', value: `${pokemonName}`, inline: true },
      { name: 'N. Pokédex', value: `${pokemon.id}`, inline: true },
      { name: 'Level', value: `${level}`, inline: true },
      { name: 'Shiny', value: `${shiny}`, inline: true },
      { name: 'Taxa de cresc.', value: `${growth}`, inline: true },
      { name: 'Elemento', value: `${pokemon.element}`, inline: true },
      { name: 'Dispon. Captura', value: `${canCatch}`, inline: true },
      { name: 'Exp ao derrotar', value: `${pokemon.base_experience * level}`, inline: true },
      { name: 'Berries Equip.', value: `${berriesLimit}`, inline: true }
    )
    .setImage(`attachment://${pokemon.name}.png`)
    .setTimestamp();

  //cria os botões
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('catch').setLabel('Capturar').setEmoji('🔴').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('battle').setLabel('Batalhar').setEmoji('⚔️').setStyle(ButtonStyle.Danger)
  );

  if (canCatch == 'Não') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('battle').setLabel('Batalhar').setEmoji('⚔️').setStyle(ButtonStyle.Danger)
    );

    interactionCollector(interaction, row);
    return interaction.reply({
      content: `${interaction.user} Você não tem mais espaço para este pokémon!`,
      components: [row],
      embeds: [embedPokemon],
      files: [file],
    });
  }

  interactionCollector(interaction, row);

  return interaction.reply({
    content: `${interaction.user}`,
    components: [row],
    embeds: [embedPokemon],
    files: [file],
  });
}

module.exports = {
  createEmbedPokemon,
  generateEvent,
};
