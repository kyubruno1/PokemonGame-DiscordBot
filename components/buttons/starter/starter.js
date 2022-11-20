const Player = require('../../../db/models/Player');
const { createAccount } = require('../../../controllers/PlayerController');
module.exports = {
  data: {
    name: `starter`,
  },
  async execute(interaction) {
    try {
      const player = await Player.findOne({ where: { discordId: interaction.user.id } });

      !player
        ? await createAccount(interaction)
        : await interaction.reply({
            content: `Já recebeu um inicial né seu espertinho!! ${interaction.user}`,
            ephemeral: true,
          });
    } catch (error) {
      console.log(error);
    }
  },
};
