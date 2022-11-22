const Inventory = require('../../../db/models/Inventory');
const { createPokeballSelectMenu } = require('../../../controllers/catchController');
module.exports = {
  data: {
    name: `catch`,
  },
  async execute(interaction) {
    const cleanUserId = interaction.message.content.replace(/[^0-9]/g, '');
    if (cleanUserId === interaction.user.id) {
      const inventory = await Inventory.findOne({
        where: { PlayerDiscordId: interaction.user.id },
      });

      if (inventory.pokeball <= 0) {
        return await interaction.reply({
          content: `Infelizmente você não tem pokébolas, ganhe batalhas de outros pokémons e compre pokebolas na loja`,
          ephemeral: true,
        });
      }

      const row = await createPokeballSelectMenu(interaction);
      await interaction.reply({ components: [row], ephemeral: true });
    }
  },
};
