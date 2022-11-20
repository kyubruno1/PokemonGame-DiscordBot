module.exports = {
  data: {
    name: `playerbattleno`,
  },
  async execute(interaction) {
    const challengedPlayer = interaction.message.content.split(' ')[3].replace(/[^0-9]/g, '');
    if (challengedPlayer == interaction.user.id) {
      return interaction.reply({ content: `Pó pó pó o franguinho ${interaction.user} fugiu` });
    }
    interaction.reply('Você não foi o desafiado');
  },
};
