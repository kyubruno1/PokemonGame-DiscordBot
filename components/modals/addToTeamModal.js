const Player = require('../../db/models/Player');
const configTeamLimit = require('config').get('pokemonTeamLimit');

module.exports = {
  data: {
    name: `addToTeamModal`,
  },
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });
    const pokemons = JSON.parse(player.pokemons);
    const team = JSON.parse(player.teams);

    //pokemon from interaction
    const id = interaction.fields.fields.get('idInput').value;
    const level = interaction.fields.fields.get('levelInput').value;
    const element = interaction.fields.fields.get('elementInput').value.toLowerCase();
    const elementCapitalized = element.charAt(0).toUpperCase() + element.slice(1);
    const growth = interaction.fields.fields.get('growthInput').value.toLowerCase();
    const growthCapitalized = growth.charAt(0).toUpperCase() + growth.slice(1);
    const exp = interaction.fields.fields.get('expInput').value;

    const findId = pokemons.find((item) => item.id == id);

    if (team.length >= configTeamLimit) {
      return interaction.reply({
        content: 'Tamanho limite do time excedido, não é possível adicionar mais.',
        ephemeral: true,
      });
    }

    const find = findId.slots.find(
      (item) =>
        item.level == level &&
        item.element == elementCapitalized &&
        item.growth == growthCapitalized &&
        item.inTeam == 'No' &&
        item.expToNextLevel == exp
    );

    if (find) {
      find.inTeam = 'Yes';
      find.id = findId.id;
      team.push(find);
      console.log(find);
    } else {
      return interaction.reply({ content: 'Não achou nenhum pokémon com esses parametros...', ephemeral: true });
    }

    console.log(team);
    interaction.reply({ content: 'Pokémon adicionado ao seu time', ephemeral: true });
    player.update({ teams: team, pokemons: pokemons });
  },
};
