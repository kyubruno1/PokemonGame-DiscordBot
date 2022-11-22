const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder().setName('perfil').setDescription('Veja seu perfil no jogo'),
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    const pokemons = JSON.parse(player.pokemons);

    let counter = 0;
    pokemons.forEach((item) => {
      if (item.alreadyCaught == 'Yes') {
        counter++;
      }
    });

    //ler e procurar o level na tabela
    const expTablePath = path.join(__dirname, '..', 'assets', 'data', 'trainer_exp_table.json');
    const data = JSON.parse(fs.readFileSync(expTablePath, { encoding: 'utf8', flag: 'r' }));
    const dataFind = data.find((item) => item.trainerLevel == player.trainerLevel);

    const playerExp = dataFind.expToNextLevel - player.expToNextLevel;

    //
    const profileEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({ name: `${interaction.user.username} - Perfil`, iconURL: `${interaction.user.displayAvatarURL()}` })
      .setDescription(
        `**__PROGRESSO__**\n**Level**: ${player.trainerLevel}
**EXP**: ${playerExp}/${dataFind.expToNextLevel}
**Vitórias PvP**: ${player.pvpWins}\n
**__POKEMONS__**
**Capturados únicos**: ${counter}
**Capturados Total**: ${player.totalCatch}
`
      )
      .setThumbnail(`${interaction.user.displayAvatarURL()}`)
      .setTimestamp();

    interaction.reply({ embeds: [profileEmbed] });
  },
};
