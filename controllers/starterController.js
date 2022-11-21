const {
  ActionRowBuilder,
  SelectMenuBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const path = require('path');
const fs = require('fs');
const config = require('config');
const configGen = config.get('generations.gen');
const configStarter = config.get('starters.pokemons');
const fetch = require('node-fetch');
/* */

function createStarterButtons() {
  let arr = [];
  options = [];
  for (i = 0; i < configGen; i++) {
    configStarter[i].starter.forEach((item) => arr.push(item.name));
    const generationOptions = {
      label: `${i + 1}ª Geração`,
      description: `Escolha entre: ${arr}`,
      value: `${arr}, ${i + 1}`,
    };

    options.push(generationOptions);
    //reseta o array
    arr = [];
  }
  const row = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId('generations')
      .setPlaceholder('Escolha uma geração de Pokemon')
      .addOptions(options)
  );
  return row;
}

async function createEmbedStarter(pokemonName, gen) {
  // Busca o pokémon
  // const result = await fetch(`http://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
  // const pokemon = await result.json();

  // Busca o pokémon no arquivo
  const generation = configStarter.find((item) => item.generation == gen);
  const pokemon = generation.starter.find((item) => item.name.trim() == pokemonName);

  // Cria o embed
  const starterPokemonPath = path.join(__dirname, '../assets/images/starter/');

  const file = new AttachmentBuilder(`${starterPokemonPath}${pokemonName}.png`);
  const embed = new EmbedBuilder()
    .setColor('EE1515')
    .addFields(
      { name: 'Nome', value: `${pokemonName}` },
      { name: 'ID Pokedex', value: `${pokemon.id}`, inline: true },
      { name: 'Elemento', value: `${pokemon.element}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: '1', inline: true },
      { name: 'Taxa de cresc.', value: 'Normal', inline: true },
      { name: '\u200B', value: '\u200B', inline: true }
    )
    .setImage(`attachment://${pokemonName}.png`)
    .setTimestamp();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('starter').setLabel(`Escolher`).setStyle(ButtonStyle.Success)
  );

  return { embed, file, row };
}

module.exports = { createStarterButtons, createEmbedStarter };
