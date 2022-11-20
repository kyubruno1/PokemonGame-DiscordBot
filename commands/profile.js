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
    const expTablePath = path.join(__dirname, '..', 'assets', 'data', 'exp_table.json');
    const data = fs.readFileSync(expTablePath, { encoding: 'utf8', flag: 'r' });
    const dataJSON = JSON.parse(data);
    const dataFind = dataJSON.find((item) => item.lvl == player.trainerLevel);

    const playerExp = dataFind.expToNextLevel - player.expToNextLevel;

    //
    const profileEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({ name: `${interaction.user.username} - Perfil`, iconURL: `${interaction.user.displayAvatarURL()}` })
      .setDescription(
        `**__PROGRESSO__**\n**Level**: ${player.trainerLevel}\n**EXP**: ${playerExp}/${dataFind.expToNextLevel}\n**Vitórias PvP**: ${player.pvpWins}\n\n**__POKEMONS__**\n**Capturados**: ${counter}\n\n`
      )
      .setThumbnail(`${interaction.user.displayAvatarURL()}`)
      .setTimestamp();

    interaction.reply({ embeds: [profileEmbed] });
  },
};
