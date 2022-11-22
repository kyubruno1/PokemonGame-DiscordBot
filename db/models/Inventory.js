const { DataTypes, Model } = require('sequelize');
const sequelize = require('../conn.js');
const Player = require('./Player.js');

const Inventory = sequelize.define(
  'Inventory',
  {
    moedas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pokeball: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    greatball: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ultraball: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    masterball: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    healthPotion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    itemEvo1: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    itemEvo2: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    badges: {
      type: DataTypes.JSON,
      defaultValue: [
        {
          gen: 1,
          name: 'Indigo',
          badges: [
            {
              name: 'Alma',
              qnt: 0,
            },
            {
              name: 'Pedregulho',
              qnt: 0,
            },
            {
              name: 'Arco iris',
              qnt: 0,
            },
            {
              name: 'Cascata',
              qnt: 0,
            },
            {
              name: 'Pantano',
              qnt: 0,
            },
            {
              name: 'Terra',
              qnt: 0,
            },
            {
              name: 'Trovao',
              qnt: 0,
            },
            {
              name: 'Vulcao',
              qnt: 0,
            },
          ],
        },
        {
          gen: 2,
          name: 'Johto',
          badges: [
            {
              name: 'Colmeia',
              qnt: 0,
            },
            {
              name: 'Geleira',
              qnt: 0,
            },
            {
              name: 'Mineral',
              qnt: 0,
            },
            {
              name: 'Nascente',
              qnt: 0,
            },
            {
              name: 'Nevoa',
              qnt: 0,
            },
            {
              name: 'Planicie',
              qnt: 0,
            },
            {
              name: 'Tempestade',
              qnt: 0,
            },
            {
              name: 'Zephir',
              qnt: 0,
            },
          ],
        },
        {
          gen: 3,
          name: 'Hoenn',
          badges: [
            {
              name: 'Articulacao',
              qnt: 0,
            },
            {
              name: 'Calor',
              qnt: 0,
            },
            {
              name: 'Chuva',
              qnt: 0,
            },
            {
              name: 'Dinamo',
              qnt: 0,
            },
            {
              name: 'Equilibrio',
              qnt: 0,
            },
            {
              name: 'Mente',
              qnt: 0,
            },
            {
              name: 'Pedra',
              qnt: 0,
            },
            {
              name: 'Pena',
              qnt: 0,
            },
          ],
        },
        {
          gen: 4,
          name: 'Sinnoh',
          badges: [
            {
              name: 'Brejo',
              qnt: 0,
            },
            {
              name: 'Carvao',
              qnt: 0,
            },
            {
              name: 'Farol',
              qnt: 0,
            },
            {
              name: 'Floresta',
              qnt: 0,
            },
            {
              name: 'Mina',
              qnt: 0,
            },
            {
              name: 'Pedregulho',
              qnt: 0,
            },
            {
              name: 'Reliquia',
              qnt: 0,
            },
            {
              name: 'Sincelo',
              qnt: 0,
            },
          ],
        },
        {
          gen: 5,
          name: 'Unova',
          badges: [
            {
              name: 'Basica',
              qnt: 0,
            },
            {
              name: 'Congelamento',
              qnt: 0,
            },
            {
              name: 'Inseto',
              qnt: 0,
            },
            {
              name: 'Jato',
              qnt: 0,
            },
            {
              name: 'Lenda',
              qnt: 0,
            },
            {
              name: 'Raio',
              qnt: 0,
            },
            {
              name: 'Tremor',
              qnt: 0,
            },
            {
              name: 'Trio',
              qnt: 0,
            },
          ],
        },
        {
          gen: 6,
          name: 'Kalos League',
          badges: [
            {
              name: 'Estrondo',
              qnt: 0,
            },
            {
              name: 'Fada',
              qnt: 0,
            },
            {
              name: 'Icebergue',
              qnt: 0,
            },
            {
              name: 'Penhasco',
              qnt: 0,
            },
            {
              name: 'Percevejo',
              qnt: 0,
            },
            {
              name: 'Planta',
              qnt: 0,
            },
            {
              name: 'Psiquica',
              qnt: 0,
            },
            {
              name: 'Voltagem',
              qnt: 0,
            },
          ],
        },
        {
          gen: 8,
          name: 'Galar',
          badges: [
            {
              name: 'Agua',
              qnt: 0,
            },
            {
              name: 'Dragao',
              qnt: 0,
            },
            {
              name: 'Fada',
              qnt: 0,
            },
            {
              name: 'Fantasma',
              qnt: 0,
            },
            {
              name: 'Fogo',
              qnt: 0,
            },
            {
              name: 'Gelo',
              qnt: 0,
            },
            {
              name: 'Grama',
              qnt: 0,
            },
            {
              name: 'Lutadora',
              qnt: 0,
            },
            {
              name: 'Rocha',
              qnt: 0,
            },
            {
              name: 'Sombria',
              qnt: 0,
            },
          ],
        },
      ],
    },
    capsules: {
      type: DataTypes.JSON,
      defaultValue: [
        {
          fragNormal: 0,
          fragFighting: 0,
          fragFlying: 0,
          fragPoison: 0,
          fragGround: 0,
          fragRock: 0,
          fragBug: 0,
          fragGhost: 0,
          fragSteel: 0,
          fragFire: 0,
          fragWater: 0,
          fragGrass: 0,
          fragPsychic: 0,
          fragIce: 0,
          fragDragon: 0,
          fragDark: 0,
          fragFairy: 0,
          fragElectric: 0,
          fragUnknown: 0,
          fragShadow: 0,
          capsuleNormal: 0,
          capsuleFighting: 0,
          capsuleFlying: 0,
          capsulePoison: 0,
          capsuleGround: 0,
          capsuleRock: 0,
          capsuleBug: 0,
          capsuleGhost: 0,
          capsuleSteel: 0,
          capsuleFire: 0,
          capsuleWater: 0,
          capsuleGrass: 0,
          capsulePsychic: 0,
          capsuleIce: 0,
          capsuleDragon: 0,
          capsuleDark: 0,
          capsuleFairy: 0,
          capsuleElectric: 0,
          capsuleUnknown: 0,
          capsuleShadow: 0,
        },
      ],
    },
  },
  {
    timestamps: false,
  }
);

Inventory.belongsTo(Player);
Player.hasOne(Inventory);

module.exports = Inventory;
