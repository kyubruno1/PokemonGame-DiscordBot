const { ActionRowBuilder, SelectMenuBuilder, ComponentType, userMention } = require('discord.js');
const Player = require('../../../db/models/Player');
const { createBoard } = require('../../../controllers/battleController');
const wait = require('node:timers/promises').setTimeout;
const configCooldown = require('config').get('universal.cooldowns.buttonInteraction');

module.exports = {
  data: {
    name: `playerbattleyes`,
  },
  async execute(interaction) {
    const challengedPlayer = interaction.message.content.split(' ')[3].replace(/[^0-9]/g, '');
    const authorPlayer = interaction.message.content.split(' ')[0].replace(/[^0-9]/g, '');

    const enemy = await Player.findOne({ where: { discordId: challengedPlayer } });
    const author = await Player.findOne({ where: { discordId: authorPlayer } });

    let enemyPokemon = '';
    let authorPokemon = '';

    if (!enemy) {
      await interaction.channel.send({
        content: `${userMention(challengedPlayer)} Você não escolheu seu pokémon inicial, escolha com /inicial`,
      });
    }

    if (!author) {
      await interaction.channel.send({
        content: `${userMention(authorPlayer)} Você não escolheu seu pokémon inicial, escolha com /inicial`,
      });
    }

    if (interaction.user.id == challengedPlayer && enemy && author) {
      function enemyPokemonChoose() {
        const team = JSON.parse(enemy.teams);

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
        interaction.reply({ content: `${userMention(challengedPlayer)} Escolha seu pokémon!`, components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.SelectMenu,
          time: configCooldown,
        });

        collector.on('collect', (i) => {
          if (i.user.id == challengedPlayer) {
            i.deferUpdate();

            enemyPokemon = i.values;
            collector.removeAllListeners();
            interaction.editReply('Ok!');
            wait(2000);
            authorPokemonChoose();
          } else {
            interaction.channel
              .send({
                content: `Não é seu turno ${i.user}`,
              })
              .then((msg) => {
                setTimeout(() => msg.delete(), 1000);
              });
          }
        });

        collector.on('end', (collected) => {
          console.log(`Collected ${collected.size} interactions.`);
        });
      }
      enemyPokemonChoose();

      function authorPokemonChoose() {
        const team = JSON.parse(author.teams);

        const options = [];
        team.forEach((item) => {
          const label = {
            label: `${item.name}`,
            description: `Lvl: ${item.level}, Elem: ${item.element}`,
            value: `Lvl: ${item.level}, Elem: ${item.element}`,
          };
          options.push(label);
        });

        // console.log(team);

        const row = new ActionRowBuilder().addComponents(
          new SelectMenuBuilder().setCustomId('select').setPlaceholder('Nada selecionado').addOptions(options)
        );
        interaction.editReply({ content: `${userMention(authorPlayer)} Escolha seu pokémon!`, components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.SelectMenu,
          time: configCooldown,
        });

        collector.on('collect', (i) => {
          if (i.user.id == authorPlayer) {
            i.deferUpdate();

            authorPokemon = i.values;
            interaction.editReply('Ok!');
            wait(2000);
            createBoard(interaction, authorPokemon, enemyPokemon);
            collector.removeAllListeners();
          } else {
            interaction.channel
              .send({
                content: `Não é seu turno ${i.user}`,
              })
              .then((msg) => {
                setTimeout(() => msg.delete(), 1000);
              });
          }
        });

        collector.on('end', (collected) => {
          console.log(`Collected ${collected.size} interactions.`);
        });
      }
      // createBoard(interaction);
    } else if (interaction.user.id != challengedPlayer) {
      interaction.reply('Não foi você o desafiado');
    }
  },
};
