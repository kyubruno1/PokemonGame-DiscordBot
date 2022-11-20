const config = require('config');
const cdConfig = config.get('cooldowns.find');
const humanizeDuration = require('humanize-duration');

const cooldowns = new Map();
module.exports = function cooldownFind(interaction) {
  if (cooldowns.has(interaction.user.id)) {
    const cooldown = cooldowns.get(interaction.user.id);

    const remaining = humanizeDuration(cooldown - Date.now(), { language: 'pt', round: true });
    return interaction.reply({
      content: `Apressadinho hein? Espera o cooldown aí! Cooldown acaba em: ${remaining}`,
      ephemeral: true,
    });
  } else {
    cooldowns.set(interaction.user.id, Date.now() + cdConfig);
    setTimeout(() => {
      cooldowns.delete(interaction.user.id);
    }, cdConfig);
  }
};
