const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const Player = require('../db/models/Player');

module.exports = {
  data: new SlashCommandBuilder().setName('rank').setDescription('Veja o rank PVP'),
  async execute(interaction) {
    const player = await Player.findAll();
    const playerArr = [];

    let playerNames = '';
    let playerWins = '';
    let playerRank = '';
    const emotelist = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    player.forEach((item) => {
      playerArr.push({
        playerId: item.discordId,
        pvpWins: item.pvpWins,
      });
    });

    playerArr.sort((a, b) => parseFloat(b.pvpWins) - parseFloat(a.pvpWins));

    for (i = 0; i <= 9; i++) {
      if (playerArr[i]) {
        playerRank += `${emotelist[i]}\n`;
        playerNames += `<@${playerArr[i].playerId}>\n`;
        playerWins += `**${playerArr[i].pvpWins}**\n`;
      }
      console.log(i + 1);
    }

    const exampleEmbed = new EmbedBuilder().setColor(0x0099ff).addFields(
      { name: 'Rank', value: `>>> ${playerRank}`, inline: true },
      {
        name: 'Jogador',
        value: `>>> ${playerNames}`,
        inline: true,
      },
      { name: 'Vitórias', value: `>>> ${playerWins}`, inline: true }
    );
    // .setTimestamp();

    interaction.reply({ embeds: [exampleEmbed] });
  },
};
