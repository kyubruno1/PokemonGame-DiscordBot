const { SlashCommandBuilder } = require('discord.js');

const { createStarterButtons } = require('../controllers/starterController');

module.exports = {
  data: new SlashCommandBuilder().setName('inicial').setDescription('Escolha um pokémon inicial!'),
  async execute(interaction) {
    const row = createStarterButtons();
    await interaction.reply({
      content: `Escolha qual geração`,
      components: [row],
    });
  },
};
