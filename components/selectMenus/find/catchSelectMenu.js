const { catchExecute } = require('../../../controllers/catchController');

module.exports = {
  data: {
    name: `pokeballSelection`,
  },
  async execute(interaction) {
    catchExecute(interaction);
  },
};
