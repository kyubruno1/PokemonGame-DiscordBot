const { Sequelize } = require('sequelize');
const { DATABASE_DIALECT, DATABASE_HOST, DATABASE_NAME, DATABASE_USER } = process.env;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, '', {
  host: DATABASE_HOST,
  dialect: DATABASE_DIALECT,
});

module.exports = sequelize;
