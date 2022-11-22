const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, userMention } = require('discord.js');
const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('batalha')
    .setDescription('Batalhe contra outros jogadores')
    .addStringOption((option) =>
      option.setName('jogador').setDescription('Coloque o @ de quem deseja desafiar').setRequired(true)
    ),
  async execute(interaction) {
    const challengedPlayer = interaction.options._hoistedOptions[0].value.replace(/[^0-9]/g, '');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('playerbattleyes').setLabel('Sim').setEmoji('⚔️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('playerbattleno').setLabel('Não').setEmoji('🐔').setStyle(ButtonStyle.Danger)
    );

    let arr = [];
    const guild = await interaction.member.guild.members.fetch();
    guild.map((member) => {
      if (member.user.id == challengedPlayer) {
        arr.push(member.user);
      }
    });

    if (arr.length == 0) {
      console.log(arr.length);
      return interaction.reply({
        content: `Não existe jogador com esse @`,
      });
    }
    interaction.reply({
      content: `${interaction.user} está desafiando ${userMention(
        challengedPlayer
      )} para um duelo Pokemon!\n${userMention(challengedPlayer)} aceita o desafio?`,
      components: [row],
    });
  },
};
