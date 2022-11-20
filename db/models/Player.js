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
    },
    pvpWins: {
      type: DataTypes.INTEGER,
    },
    trainerLevel: {
      type: DataTypes.INTEGER,
    },
    expToNextLevel: {
      type: DataTypes.INTEGER,
    },
    teams: {
      type: DataTypes.JSON,
    },
    pokemons: {
      type: DataTypes.JSON,
    },
    capsules: {
      type: DataTypes.JSON,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Player;
