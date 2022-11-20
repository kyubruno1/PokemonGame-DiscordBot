const { ActionRowBuilder, SelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../db/models/Player');

async function createEmbedFactory(interaction) {
  const embedFactory = new EmbedBuilder()
    .setColor('EE1515')
    .setTitle('Bem vindo à fabrica!')
    .setDescription(
      'Aqui você pode criar, equipar e remover berries de seus pokémons, além de encapsular um pokémon para receber fragmentos de berries'
    )
    .setAuthor({
      name: 'Escolha nos botões abaixo a ação a tomar',
      iconURL: 'https://pngimg.com/uploads/pokeball/pokeball_PNG8.png',
    })
    .setImage(
      `https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/08/pokemon-center-00-featured.jpg?q=50&fit=contain&w=960&h=480&dpr=1.5`
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('create').setLabel('Criar Berry').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('equip').setLabel('Equipar Berry').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('remove').setLabel('Remover Berry').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('encapsulate').setLabel('Encapsular Pokémon').setStyle(ButtonStyle.Primary)
  );

  return await interaction.reply({
    content: `${interaction.user}`,
    embeds: [embedFactory],
    // files: [image],
    components: [row],
    ephemeral: true,
  });
}

async function encapsulatePokemon(interaction) {}

module.exports = { createEmbedFactory };
