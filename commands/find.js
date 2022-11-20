const { SlashCommandBuilder } = require('discord.js');
const configEvent = require('config').get('findCommandEventChancePercentage');
const chance = require('chance').Chance();
const Player = require('../db/models/Player');
const findCooldown = require('../functions/helpers/findCooldown');
const { createEmbedPokemon, generateEvent } = require('../controllers/findController');

module.exports = {
  data: new SlashCommandBuilder().setName('encontrar').setDescription('Encontre algo no mundo pokemon!'),
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    if (!player) {
      return interaction.reply({
        content: `Digite /inicial para escolher seu pokémon inicial primeiro!`,
        ephemeral: true,
      });
    }

    if (!findCooldown(interaction)) {
      const dice = chance.integer({ min: 1, max: 100 });
      if (dice <= configEvent) {
        return generateEvent(interaction);
      }
      createEmbedPokemon(interaction, player);
    }
  },
};
