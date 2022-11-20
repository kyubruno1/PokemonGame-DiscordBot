const { SlashCommandBuilder } = require('discord.js');
const { createEmbedFactory } = require('../controllers/factoryController');

const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fabrica')
    .setDescription('Crie berries, equipe ou desequipe de seus pokemons'),
  async execute(interaction) {
    // createEmbedFactory(interaction);
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    console.log(player.capsules);
    const pokemons = JSON.parse(player.pokemons);
    console.log(pokemons[6].slots[0]);
  },
};
