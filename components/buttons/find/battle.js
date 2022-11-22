module.exports = {
  data: {
    name: `battle`,
  },
  async execute(interaction) {
    // // let arr = [];
    // const guild = await interaction.member.guild.members.fetch();
    // // guild.map((member) => arr.push(member.user));
    // guild.map((member) => {
    //   if (member.user.id == interaction.user.id) {
    //     console.log(interaction.user);
    //   }
    // });
    // // interaction.reply(`${arr}`);
    interaction.reply(`battle`);
  },
};
