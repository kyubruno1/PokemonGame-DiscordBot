const Player = require('../db/models/Player');
const wait = require('node:timers/promises').setTimeout;
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const configInteractionCooldown = require('config').get('universal.cooldowns.buttonInteraction');

async function showPokemons(interaction, pokemons) {
  await interaction.reply({ content: 'Carregando pokémons...', ephemeral: true });

  //array inicial com cabeçalho
  let arr = [
    '**ID** | **NOME** | **LEVEL** | **ELEMENTO** | **CRESC.** | **BERRIES EQUIPADAS** | **EXP P/ PROXIMO NIVEL**\n',
  ];

  //realiza o loop pelo array de pokemons para criar uma string e adicionar na string inicial
  if (interaction.commandName == 'pokedex') {
    for (i = 0; i < pokemons.length; i++) {
      if (pokemons[i].slots.length > 0) {
        pokemons[i].slots.forEach((item) => {
          arr.push(
            `#${pokemons[i].id} | ${item.name} | ${item.level} | ${item.element} | ${item.growth} | ${item.berries.equiped.length} | ${item.expToNextLevel}\n`
          );
        });
      }
    }
  } else if (interaction.customId == 'seeTeam') {
    // arr = ['**ID **| **NOME** | **LEVEL** | **ELEMENTO** | **CRESC.** | **BERRIES EQUIPADAS** | **EXP P/ PROXIMO NIVEL**\n'];
    // console.log(pokemons);
    pokemons.forEach((item) => {
      arr.push(
        `#${item.id} | ${item.name} | ${item.level} | ${item.element} | ${item.growth} | ${item.berries.equiped.length} | ${item.expToNextLevel}\n`
      );
    });
  }

  //limite máximo de caracteres que o discord aceita por mensagem é 2000
  let letterLimit = 2000; //quebrar minimo 60

  //verifica quantas vezes a string principal de pokemons cabe dentro do limite
  let qnt = Math.round(arr.join('').length / letterLimit);

  //verifica se a divisão acima é maior que a string arredondada, se a string for numero quebrado tipo 9.5 ou 7.32,
  //vai adicionar uma quantidade a mais no loop final de envio de mensagens para enviar o "resto"
  if (arr.join('').length / letterLimit > Math.round(arr.join('').length / letterLimit)) {
    qnt = qnt + 1;
  }

  //realiza o loop pela quantidade de vezes que precisa ser enviado as mensagens e quebra as strings nos caracteres certos
  let breakPoint = 0;
  for (i = 1; i <= qnt; i++) {
    let letterCounter = letterLimit * i;
    if (arr.join('').length >= letterCounter) {
      while (arr.join('').charAt(letterCounter) != '#') {
        letterCounter--;
      }
    }
    // await wait(2000);
    if (i == 1) {
      interaction.editReply({ content: `${arr.join('').slice(breakPoint, letterCounter)}`, ephemeral: true });
    } else {
      interaction.followUp({ content: `${arr.join('').slice(breakPoint, letterCounter)}`, ephemeral: true });
    }

    breakPoint = letterCounter;
  }
}

async function showPokemonsTeam(interaction) {
  // Create the modal
  const modal = new ModalBuilder().setCustomId('addToTeamModal').setTitle('Adicionar ao time');

  // Add components to modal

  // Create the text input components
  const idInput = new TextInputBuilder()
    .setCustomId('idInput')
    .setLabel('Número do **ID** da pokedex')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Primeiro campo exibido no /pokedex')
    .setRequired(true);

  const levelInput = new TextInputBuilder()
    .setCustomId('levelInput')
    .setLabel('Level do Pokémon')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Terceiro campo exibido no /pokedex')
    .setRequired(true);

  const elementInput = new TextInputBuilder()
    .setCustomId('elementInput')
    .setLabel('Elemento do Pokémon')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Quarto campo exibido no /pokedex')
    .setRequired(true);

  const growthInput = new TextInputBuilder()
    .setCustomId('growthInput')
    .setLabel('Taxa de crescimento do Pokémon')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Quinto campo exibido no /pokedex')
    .setRequired(true);

  const expInput = new TextInputBuilder()
    .setCustomId('expInput')
    .setLabel('Qnt de EXP do Pokémon para o próximo nível')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Último campo exibido no /pokedex')
    .setRequired(true);

  // An action row only holds one text input,
  // so you need one action row per text input.
  const firstActionRow = new ActionRowBuilder().addComponents(idInput);
  const secondActionRow = new ActionRowBuilder().addComponents(levelInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(elementInput);
  const fourthActionRow = new ActionRowBuilder().addComponents(growthInput);
  const fifthActionRow = new ActionRowBuilder().addComponents(expInput);

  // Add inputs to the modal
  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

  // Show the modal to the user
  await interaction.showModal(modal);

  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.modal,
    time: configInteractionCooldown,
  });
  collector.on('collect', async (i) => {
    // console.log(i);
  });
  collector.on('end', async (i) => {});
}

async function createTeamEmbed(interaction) {
  const embedTeam = new EmbedBuilder()
    .setColor('EE1515')
    .setTitle('Gerencie seu time pokémon')
    .setAuthor({
      name: 'Escolha nos botões abaixo a ação a tomar',
      iconURL: 'https://pngimg.com/uploads/pokeball/pokeball_PNG8.png',
    })
    .setImage(`https://sucodemanga.com.br/wp-content/uploads/2013/10/pokemon-team-thumb.jpg`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('add').setLabel('Adicionar Pokémon').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('del').setLabel('Remover Pokémon').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('seeTeam').setLabel('Ver seu time').setStyle(ButtonStyle.Primary)
  );

  return await interaction.reply({
    content: `${interaction.user}`,
    embeds: [embedTeam],
    // files: [image],
    components: [row],
    ephemeral: true,
  });
}

module.exports = { showPokemons, createTeamEmbed, showPokemonsTeam };
