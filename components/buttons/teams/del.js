const { ActionRowBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');
const Player = require('../../../db/models/Player');
const configCooldown = require('config').get('universal.cooldowns.buttonInteraction');
module.exports = {
  data: {
    name: `del`,
  },
  async execute(interaction) {
    console.log('del pokemon from a team');

    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    const pokemonTeam = JSON.parse(player.teams);
    const pokemons = JSON.parse(player.pokemons);
    const options = [];

    if (!pokemonTeam || !pokemons) {
      return interaction.reply({ content: `${interaction.user} Não há pokemons no seu time` });
    }
    // console.log(pokemonTeam);

    pokemonTeam.forEach((item, index) => {
      const label = {
        label: `${item.name}`,
        description: `Lvl: ${item.level}, Elem: ${item.element}, Cresc: ${item.growth}`,
        value: `Name: ${item.name}, Lvl: ${item.level}, Elem: ${item.element}, growth: ${item.growth}, exp: ${
          item.expToNextLevel
        }, id: ${item.id}, ind: ${item.level + index}`,
      };
      options.push(label);
    });

    const row = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder().setCustomId('select').setPlaceholder('Nada selecionado').addOptions(options)
    );

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      time: configCooldown,
    });

    collector.on('collect', (i) => {
      i.deferUpdate();

      const infos = {
        name: i.values[0].split(', ')[0].split(': ')[1],
        level: i.values[0].split(', ')[1].split(': ')[1],
        element: i.values[0].split(', ')[2].split(': ')[1],
        growth: i.values[0].split(', ')[3].split(': ')[1],
        exp: i.values[0].split(', ')[4].split(': ')[1],
        id: i.values[0].split(', ')[5].split(': ')[1],
      };

      //procura e altera a coluna teams
      const pokemonFindTeam = pokemonTeam.find(
        (item) =>
          item.name == infos.name &&
          item.level == infos.level &&
          item.element == infos.element &&
          item.growth == infos.growth &&
          item.expToNextLevel == infos.exp &&
          item.id == infos.id
      );
      //procura o index e corta ele da array
      const indexPokemonTeam = pokemonTeam.indexOf(pokemonFindTeam);
      pokemonTeam.splice(indexPokemonTeam, 1);

      //procura e altera a coluna pokemons
      const findPokemon = pokemons.find((item) => item.id == pokemonFindTeam.id);
      // findPokemon.inTeam = 'No';
      const findPokemonSlot = findPokemon.slots.find(
        (item) =>
          item.name == pokemonFindTeam.name &&
          item.level == pokemonFindTeam.level &&
          item.element == pokemonFindTeam.element &&
          item.growth == pokemonFindTeam.growth &&
          item.expToNextLevel == pokemonFindTeam.expToNextLevel
      );
      findPokemonSlot.inTeam = 'No';

      //procura o index e corta ele da array
      // const indexPokemon = findPokemon.slots.indexOf(findPokemonSlot);
      // findPokemon.slots.splice(indexPokemon, 1);

      collector.removeAllListeners();
      player.update({ teams: pokemonTeam, pokemons: pokemons });

      return interaction.editReply({ content: 'Pokémon removido com sucesso', components: [], ephemeral: true });
    });

    collector.on('end', (collected) => {
      // console.log(`Collected ${collected.size} interactions.`);
    });

    await interaction.reply({
      content: 'Escolha seu pokémon para retirar do time',
      components: [row],
      ephemeral: true,
    });
  },
};
