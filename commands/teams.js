const { SlashCommandBuilder } = require('discord.js');
const { createTeamEmbed } = require('../controllers/pokemonController');

module.exports = {
  data: new SlashCommandBuilder().setName('time').setDescription('Crie e gerencie seu time'),
  async execute(interaction) {
    createTeamEmbed(interaction);
  },
};
