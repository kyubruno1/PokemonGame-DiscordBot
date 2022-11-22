const { SlashCommandBuilder } = require('discord.js');
const prices = require('config').get('store.prices');
const Player = require('../db/models/Player');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('loja')
    .setDescription('Loja do mundo pokémon! Compre itens como pokébolas, pedras de evolução e mais')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('Escolha o item para comprar')
        .setRequired(true)
        .addChoices(
          { name: `Pokeball - ${prices.pokebola} moedas`, value: 'pokeball' },
          { name: `Greatball - ${prices.greatball} moedas`, value: 'greatball' },
          { name: `Ultraball - ${prices.ultraball} moedas`, value: 'ultraball' },
          {
            name: `Poção de vida (Cura toda a vida do pokémon) - ${prices.healthPotion} moedas`,
            value: 'healthPotion',
          },
          { name: `Item de evolução tier 1 - ${prices.itemEvo1} moedas`, value: 'itemEvo1' },
          { name: `Item de evolução tier 2 - ${prices.itemEvo2} moedas`, value: 'itemEvo2' },
          { name: `VIP Pass - ${prices.vip} moedas`, value: 'itemEvo2' }
        )
    )
    .addStringOption((option) =>
      option.setName('quantidade').setDescription('Adicione a quantidade').setRequired(true)
    ),
  async execute(interaction) {},
};
