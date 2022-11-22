const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const vipCheck = require('../functions/helpers/verifyVIP');

const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder().setName('perfil').setDescription('Veja seu perfil no jogo'),
  async execute(interaction) {
    try {
      const player = await Player.findOne({ where: { discordId: interaction.user.id } });
      if (!player) {
        return interaction.reply({
          content: `Digite /inicial para escolher seu pokémon inicial primeiro!`,
          ephemeral: true,
        });
      }

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

      //cria a string para exibir no embed
      let string = `**__PROGRESSO__**\n**Level**: ${player.trainerLevel}
    **EXP**: ${playerExp}/${dataFind.expToNextLevel}
    **Vitórias PvP**: ${player.pvpWins}\n
    **__POKEMONS__**
    **Capturados únicos**: ${counter}
    **Capturados Total**: ${player.totalCatch}`;

      vipCheck(player.vipUntil, interaction.user.id);

      if (player.vipUntil != null) {
        string = `${string}
      --------------
      **VIP ATÉ: ${player.vipUntil.toLocaleString()}**`;
      }

      const profileEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ name: `${interaction.user.username} - Perfil`, iconURL: `${interaction.user.displayAvatarURL()}` })
        .setDescription(string)
        .setThumbnail(`${interaction.user.displayAvatarURL()}`)
        .setTimestamp();

      interaction.reply({ embeds: [profileEmbed] });
    } catch (err) {
      console.log(err);
    }
  },
};
