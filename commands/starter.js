const { SlashCommandBuilder } = require('discord.js');
const { createStarterSelectMenu } = require('../controllers/starterController');
const wait = require('node:timers/promises').setTimeout;
const teamLimit = require('config').get('universal.pokemonTeamLimit');

const Player = require('../db/models/Player');

module.exports = {
  data: new SlashCommandBuilder().setName('inicial').setDescription('Escolha um pokémon inicial!'),
  async execute(interaction) {
    const player = await Player.findOne({ where: { discordId: interaction.user.id } });

    if (player) {
      return await interaction.reply({
        content: `Já recebeu um inicial né seu espertinho!! ${interaction.user}`,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `**_Bem vindo ao PokemonTrainer, um bot-game baseado nos antigos jogos de pokémon para navegadores._**\nA seguir você vai aprender brevemente sobre o jogo.
 \n**Estes são os comandos e suas explicações**
**/encontrar**: Este é o comando principal do jogo, onde você encontra pokémons selvagens no mundo pokémon. Ao encontrar um pokémon, você terá duas opções: **capturar** ou **batalhar**, e você só pode realizar uma ação por pokémon.
**/time**: Aqui é onde você gerencia seu time principal, são até ${teamLimit} pokémons que podem ser adicionados em seu time. Apenas pokémons do seu time podem ser utilizados durante as ações do jogo.
**/pokedex**: Você consegue ver todos os pokémons que estão na sua pokédex, todos os pokémons que você capturou e não estão no seu time. É um comando apenas de exibição. Você não consegue manipular pokémons da pokédex sem adicioná-los ao seu time.  
**/evoluir**: Neste comando você consegue evoluir (ou tentar!) um pokémon do seu time. 
**/inventario**: Você pode ver o seu inventário de itens utilizaveis e insígnias.`,
      ephemeral: true,
    });

    await wait(4000);
    await interaction.followUp({
      content: `**/loja**: Onde você pode comprar itens utilizáveis como pokébolas, itens de evolução...
**/fabrica**: Aqui você pode criar capsulas para equipar em nos pokémons do seu time.
**/batalha**: Quer desafiar seu amigo? Aqui é onde você consegue batalhar entre jogadores. 
**/rank**: Exibe o ranking PVP.
**/perfil**: Exibe informações sobre seu progresso no jogo.
**/info**: Exibe informações gerais sobre o jogo em detalhe.

**_PARA SABER MAIS SOBRE OS COMANDOS E SOBRE O JOGO, USE O COMANDO /info_**`,
      ephemeral: true,
    });

    const row = createStarterSelectMenu();

    await wait(4000);
    await interaction.followUp({
      content: `${interaction.user} Agora que você já conhece brevemente o jogo, que tal escolher um pokémon para iniciar sua jornada?`,
      components: [row],
      ephemeral: true,
    });
  },
};
