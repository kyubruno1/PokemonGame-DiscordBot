const { ActionRowBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { catchExecute, executeCatch } = require('../../../controllers/catchController');

module.exports = {
  data: {
    name: `pokeballSelection`,
  },
  async execute(interaction) {
    catchExecute(interaction);
  },
};
