const { DataTypes, Model } = require('sequelize');
const sequelize = require('../conn.js');

const Player = sequelize.define(
  'Player',
  {
    name: {
      type: DataTypes.STRING,
    },
    discordId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    gotInitial: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    pvpWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    trainerLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    expToNextLevel: {
      type: DataTypes.INTEGER,
    },
    totalCatch: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    vipUntil: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    teams: {
      type: DataTypes.JSON,
    },
    pokemons: {
      type: DataTypes.JSON,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Player;
