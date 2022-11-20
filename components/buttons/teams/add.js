const { showPokemonsTeam } = require('../../../controllers/pokemonController');
module.exports = {
  data: {
    name: `add`,
  },
  async execute(interaction) {
    showPokemonsTeam(interaction);
  },
};
