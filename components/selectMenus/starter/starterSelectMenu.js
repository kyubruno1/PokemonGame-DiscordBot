const wait = require('node:timers/promises').setTimeout;
const { createEmbedStarter } = require('../../../controllers/starterController');
module.exports = {
  data: {
    name: `generations`,
  },
  async execute(interaction) {
    const [first, second, third] = interaction.values[0].replaceAll(' ', '').split(',');

    const generation = interaction.values[0].replaceAll(' ', '').split(',')[3];

    const fPokemon = await createEmbedStarter(first, generation);
    const sPokemon = await createEmbedStarter(second, generation);
    const tPokemon = await createEmbedStarter(third, generation);

    await interaction.reply({
      embeds: [fPokemon.embed],
      components: [fPokemon.row],
      files: [fPokemon.file],
      ephemeral: true,
    });
    await wait(300);
    await interaction.followUp({
      embeds: [sPokemon.embed],
      components: [sPokemon.row],
      files: [sPokemon.file],
      ephemeral: true,
    });
    await wait(300);
    await interaction.followUp({
      embeds: [tPokemon.embed],
      components: [tPokemon.row],
      files: [tPokemon.file],
      ephemeral: true,
    });
  },
};
