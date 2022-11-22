const { createBoardEvent, createJokenpo } = require('../../../controllers/battleController');
const Player = require('../../../db/models/Player');
const { ActionRowBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');
const configCooldown = require('config').get('universal.cooldowns.buttonInteraction');

module.exports = {
  data: {
    name: `battleGym`,
  },
  async execute(interaction) {
    const gameType = interaction.message.embeds[0].fields[4].value;
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });

    if (!player) {
      return await interaction.reply({
        content: `${interaction.user} Você não escolheu seu pokémon inicial, escolha com /inicial`,
        ephemeral: true,
      });
    }

    function playerPokemonChoose() {
      const team = JSON.parse(player.teams);

      const options = [];
      team.forEach((item, index) => {
        const label = {
          label: `${item.name}`,
          description: `Lvl: ${item.level}, Elem: ${item.element}`,
          value: `Lvl: ${item.level}, Elem: ${item.element}, ind: ${item.level + index}`,
        };
        options.push(label);
      });

      const row = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder().setCustomId('select').setPlaceholder('Nada selecionado').addOptions(options)
      );
      interaction.reply({ content: `${interaction.user} Escolha seu pokémon!`, components: [row], ephemeral: true });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.SelectMenu,
        time: configCooldown,
      });

      collector.on('collect', (i) => {
        i.deferUpdate();
        playerPokemon = i.values;
        if (gameType == 'Campo Minado') {
          collector.removeAllListeners();
          interaction.editReply({ content: 'Ok!', ephemeral: true });
          createBoardEvent(interaction, playerPokemon);
        } else if (gameType == 'Jokenpo') {
          collector.removeAllListeners();
          interaction.editReply({ content: 'Ok!', ephemeral: true });
          createJokenpo(interaction, playerPokemon);
        }
      });

      collector.on('end', (collected) => {
        console.log(`Collected ${collected.size} interactions.`);
      });
    }
    playerPokemonChoose();
  },
};
