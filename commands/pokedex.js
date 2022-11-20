const { SlashCommandBuilder } = require('discord.js');

const { showPokemons } = require('../controllers/pokemonController');
const { checkTrainerLevelUp } = require('../controllers/PlayerController');

const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder().setName('pokedex').setDescription('Veja sua pokedex'),
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    const pokemons = JSON.parse(player.pokemons);
    showPokemons(interaction, pokemons);
  },
};
