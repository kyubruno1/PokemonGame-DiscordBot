const Player = require('../../../db/models/Player');
const { showPokemons } = require('../../../controllers/pokemonController');
module.exports = {
  data: {
    name: `seeTeam`,
  },
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    if (!player) {
      return interaction.reply({
        content: `Digite /inicial para escolher seu pokémon inicial primeiro!`,
        ephemeral: true,
      });
    }
    const pokemons = JSON.parse(player.teams);
    showPokemons(interaction, pokemons);
  },
};
