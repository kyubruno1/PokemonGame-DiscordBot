const { SlashCommandBuilder } = require('discord.js');

const { showPokemons } = require('../controllers/pokemonController');

const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder().setName('pokedex').setDescription('Veja sua pokedex'),
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    if (!player) {
      return interaction.reply({
        content: `Digite /inicial para escolher seu pokémon inicial primeiro!`,
        ephemeral: true,
      });
    }
    const pokemons = JSON.parse(player.pokemons);
    showPokemons(interaction, pokemons);
  },
};
