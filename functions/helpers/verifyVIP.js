const datefns = require('date-fns');
const Player = require('../../db/models/Player');
module.exports = async function vipCheck(vipDate, user) {
  const now = Date.now();

  const dateCompare = datefns.isBefore(now, vipDate);
  if (dateCompare == false) {
    if (vipDate != null) {
      Player.update({ vipUntil: null }, { where: { discordId: user } });
    }
    return false;
  }
  return true;
};
