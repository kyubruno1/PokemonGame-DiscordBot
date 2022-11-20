const { InteractionType } = require('discord.js');
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: 'Ocorreu um erro executando este comando.',
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const button = interaction.client.buttons.get(interaction.customId);

      if (!button) return;
      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.type == InteractionType.ModalSubmit) {
      const modal = interaction.client.modals.get(interaction.customId);

      if (!modal) return;
      try {
        await modal.execute(interaction);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isSelectMenu()) {
      const selectMenu = interaction.client.selectMenus.get(interaction.customId);

      if (!selectMenu) return;
      try {
        await selectMenu.execute(interaction);
      } catch (error) {
        console.log(error);
      }
    }
  },
};
