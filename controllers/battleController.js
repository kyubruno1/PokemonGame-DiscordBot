const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, userMention } = require('discord.js');
const Inventory = require('../db/models/Inventory');
const Player = require('../db/models/Player');
const fs = require('fs');
const path = require('path');
const chance = require('chance').Chance();
const { checkTrainerLevelUp } = require('./PlayerController');

//config
const config = require('config');
const configCooldown = config.get('cooldowns.interacaoBotoes');
const configChances = config.get('chancesGymDefault');
const configChancesPVP = config.get('chancesPvPDefault');
const configFieldSize = config.get('gymFieldSize');
const configFieldSizePVP = config.get('pvpFieldSize');
const configGymLeaderLife = config.get('gymLeaderLife');
const configPlayerLifePVP = config.get('playerLifePVP');
const configGymJokenpoWinChance = config.get('gymJokenpoWinChance');
const configGymPrize = config.get('gymPrizeDefault');

//read elements
const dataPath = path.join(__dirname, '..', 'assets', 'data', `elements.json`);
const data = fs.readFileSync(dataPath, { encoding: 'utf8', flag: 'r' });
const elementsData = JSON.parse(data);

async function createBoard(interaction, aPokemon, ePokemon) {
  //pokemons
  const auPokemonLvl = aPokemon.toString().split(',')[0].split(' ')[1];
  const auPokemonElem = aPokemon.toString().split(',')[1].split(': ')[1].toLowerCase();

  const enPokemonLvl = ePokemon.toString().split(',')[0].split(' ')[1];
  const enPokemonElem = ePokemon.toString().split(',')[1].split(': ')[1].toLowerCase();

  const enemyElement = elementsData.find((item) => item.portuguese == enPokemonElem);
  const authorElement = elementsData.find((item) => item.portuguese == auPokemonElem);

  const diffLvl = auPokemonLvl - enPokemonLvl;

  // players
  const enemy = interaction.message.content.split(' ')[0].replace(/[^0-9]/g, '');
  const author = interaction.message.content.split(' ')[3].replace(/[^0-9]/g, '');
  let enemyChances = configChancesPVP.default;
  let authorChances = configChancesPVP.default;

  if (enemyElement.strong.includes(auPokemonElem)) {
    enemyChances = enemyChances + configChancesPVP.elementWinIncrease;
  }

  if (authorElement.strong.includes(enPokemonElem)) {
    authorChances = authorChances + configChancesPVP.elementWinIncrease;
  }

  if (diffLvl > 0) {
    for (i = 0; i < diffLvl; i++) {
      if (i % configChancesPVP.howMuchLevelToIncreaseChance == 0) {
        authorChances = authorChances + configChancesPVP.levelWinIncrease;
      }
    }
  } else if (diffLvl < 0) {
    diffLvl = diffLvl * -1;
    for (i = 0; i < diffLvl; i++) {
      if (i % configChancesPVP.howMuchLevelToIncreaseChance == 0) {
        enemyChances = enemyChances + configChancesPVP.levelWinIncrease;
      }
    }
  }

  //campo
  const fieldWidth = configFieldSizePVP.width;
  const fieldHeight = configFieldSizePVP.height;
  const totalButtons = fieldWidth * fieldHeight;

  //cria linhas
  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();
  const row3 = new ActionRowBuilder();
  const row4 = new ActionRowBuilder();
  const row5 = new ActionRowBuilder();

  const component = [];

  for (i = 1; i <= totalButtons; i++) {
    const button = new ButtonBuilder().setCustomId(`${i}`).setLabel(`${i}`).setStyle(ButtonStyle.Primary);
    if (row1.components.length < fieldWidth) {
      row1.addComponents(button);
    } else if (row2.components.length < fieldWidth) {
      row2.addComponents(button);
    } else if (row3.components.length < fieldWidth) {
      row3.addComponents(button);
    } else if (row4.components.length < fieldWidth) {
      row4.addComponents(button);
    } else if (row5.components.length < fieldWidth) {
      row5.addComponents(button);
    }

    if (i == totalButtons) {
      component.push(row1, row2, row3, row4, row5);
    }
  }

  let filteredComponent = component.filter((item) => item.components != '');

  let authorTurn = true;

  let selected = [];
  let authorSelected = [];
  let enemySelected = [];
  let authorRightGuess = 0;
  let enemyRightGuess = 0;

  /*
  CRIA O GAME EM SI
  */

  async function firstTurn() {
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: configCooldown,
    });

    collector.on('collect', (i) => {
      i.deferUpdate();

      if (i.user.id == interaction.user.id && authorTurn == true) {
        const find = selected.includes(i.customId);
        if (selected.length < configPlayerLifePVP && !find) {
          selected.push(i.customId);
        }

        if (find) {
          interaction.editReply({
            content: `${userMention(author)} **JÁ SELECIONOU ESTE CAMPO**.`,
            components: [...filteredComponent],
          });
        } else {
          interaction.editReply({
            content: `${userMention(author)} Você selecionou **${selected.length}** campos, ainda falta selecionar **${
              configPlayerLifePVP - selected.length
            }**.`,
            components: [...filteredComponent],
          });
        }

        if (selected.length >= configPlayerLifePVP) {
          collector.removeAllListeners();
          authorSelected = selected;
          selected = [];
          authorTurn = !authorTurn;
          changeTurn(interaction);
        }
      } else {
        interaction.channel
          .send({
            content: `Não é seu turno ${i.user}`,
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 1000);
          });
      }
    });

    collector.on('end', (collected, reason) => {
      if (selected.length < configPlayerLifePVP && reason == 'time') {
        interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [] });
      }
    });
  }
  firstTurn();

  async function changeTurn(interaction) {
    if (authorTurn == false) {
      interaction.editReply({
        content: ` ${userMention(enemy)} **SEU TURNO!** `,
        components: [...filteredComponent],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: configCooldown,
      });

      collector.on('collect', (i) => {
        i.deferUpdate();

        if (i.user.id == enemy && authorTurn == false) {
          const find = selected.includes(i.customId);
          if (selected.length < configPlayerLifePVP && !find) {
            selected.push(i.customId);
          }

          if (find) {
            interaction.editReply({
              content: `${userMention(enemy)} **JÁ SELECIONOU ESTE CAMPO**.`,
              components: [...filteredComponent],
            });
          } else {
            interaction.editReply({
              content: `${userMention(enemy)} Você selecionou **${selected.length}** campos, ainda falta selecionar **${
                configPlayerLifePVP - selected.length
              }**.`,
              components: [...filteredComponent],
            });
          }

          if (selected.length >= configPlayerLifePVP) {
            collector.removeAllListeners();
            enemySelected = selected;
            selected = [];
            authorTurn = !authorTurn;
            firstAttackTurn();
          }
        } else {
          interaction.channel
            .send({
              content: `Não é seu turno ${i.user}`,
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 1000);
            });
        }
      });

      collector.on('end', (collected, reason) => {
        if (selected.length < configPlayerLifePVP && reason == 'time') {
          interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [] });
        }
      });
    }
  }

  function firstAttackTurn() {
    if (authorTurn == true) {
      interaction.editReply({
        content: ` ${userMention(author)} **SEU TURNO DE ATAQUE!** Você tem ${enemyChances - selected.length} chances`,
        components: [...filteredComponent],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: configCooldown,
      });

      collector.on('collect', (i) => {
        i.deferUpdate();

        if (i.user.id == author && authorTurn == true) {
          const find = enemySelected.includes(i.customId);

          filteredComponent.forEach((item, index) => {
            item.components.forEach((item) => {
              if (item.data.custom_id == i.customId && find) {
                item.setDisabled(true);
                item.setStyle(ButtonStyle.Success);
                authorRightGuess = authorRightGuess + 1;
              }
              if (item.data.custom_id == i.customId && !find) {
                item.setDisabled(true);
                item.setStyle(ButtonStyle.Danger);
              }
            });
          });

          if (selected.length < enemyChances) {
            selected.push(i.customId);
          }
          interaction.editReply({
            content: `Você tem ${enemyChances - selected.length} chances`,
            components: [...filteredComponent],
          });

          if (authorRightGuess >= configPlayerLifePVP || selected.length >= enemyChances) {
            collector.removeAllListeners();
            authorTurn = !authorTurn;
            selected = [];
            filteredComponent = component.filter((item) => item.components != '');
            secondAttackTurn();
          }
        } else {
          interaction.channel
            .send({
              content: `Não é seu turno ${i.user}`,
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 1000);
            });
        }
      });

      collector.on('end', (collected, reason) => {
        if (selected.length < configPlayerLifePVP && reason == 'time') {
          interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [] });
        }
      });
    }
  }

  function secondAttackTurn() {
    filteredComponent.forEach((item, index) => {
      item.components.forEach((item) => {
        item.setDisabled(false);
        item.setStyle(ButtonStyle.Primary);
      });
    });
    if (authorTurn == false) {
      interaction.editReply({
        content: ` ${userMention(enemy)} **SEU TURNO DE ATAQUE!** Você tem ${authorChances - selected.length} chances`,
        components: [...filteredComponent],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: configCooldown,
      });

      collector.on('collect', (i) => {
        i.deferUpdate();

        if (i.user.id == enemy && authorTurn == false) {
          const find = authorSelected.includes(i.customId);

          filteredComponent.forEach((item, index) => {
            item.components.forEach((item) => {
              if (item.data.custom_id == i.customId && find) {
                item.setDisabled(true);
                item.setStyle(ButtonStyle.Success);
                enemyRightGuess = enemyRightGuess + 1;
              }
              if (item.data.custom_id == i.customId && !find) {
                item.setDisabled(true);
                item.setStyle(ButtonStyle.Danger);
              }
            });
          });

          if (selected.length < authorChances) {
            selected.push(i.customId);
          }
          interaction.editReply({
            content: `Você tem ${authorChances - selected.length} chances`,
            components: [...filteredComponent],
          });

          if (enemyRightGuess >= configPlayerLifePVP || selected.length >= authorChances) {
            collector.removeAllListeners();
            gameEnded();
          }
        } else {
          interaction.channel
            .send({
              content: `Não é seu turno ${i.user}`,
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 1000);
            });
        }
      });

      collector.on('end', (collected, reason) => {
        if (selected.length < configPlayerLifePVP && reason == 'time') {
          interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [] });
        }
      });
    }
  }

  function gameEnded() {
    if (authorRightGuess > enemyRightGuess) {
      console.log(author);
      Player.increment({ pvpWins: 1 }, { where: { discordId: author } });
      return interaction.editReply({
        content: ` ${userMention(
          author
        )} Venceu por **${authorRightGuess}** acertos contra ${enemyRightGuess} do ${userMention(enemy)}`,
        components: [],
      });
    } else if (authorRightGuess < enemyRightGuess) {
      console.log(enemy);
      Player.increment({ pvpWins: 1 }, { where: { discordId: enemy } });

      return interaction.editReply({
        content: ` ${userMention(
          enemy
        )} Venceu por **${enemyRightGuess}** acertos contra ${authorRightGuess} do ${userMention(author)}`,
        components: [],
      });
    } else if (authorRightGuess == enemyRightGuess) {
      return interaction.editReply({
        content: ` ${userMention(author)} ${userMention(enemy)} Houve um empate entre os dois!`,
        components: [],
      });
    }
  }

  return await interaction.editReply({
    content: `${
      interaction.message.content.split(' ')[3]
    } Seu turno de **DEFESA** Neste turno, você DEVE escolher ${configPlayerLifePVP} campos para serem sua "vida".`,
    components: [...filteredComponent],
  });
}

async function createBoardEvent(interaction, pokemon) {
  //enemy
  const enemyElement = interaction.message.embeds[0].fields[1].value;
  const difficulty = interaction.message.embeds[0].fields[5].value;
  const enemyPokemonLevel = interaction.message.embeds[0].fields[3].value;
  const enemyLeague = interaction.message.embeds[0].fields[6].value;
  const enemyBadge = interaction.message.embeds[0].fields[2].value;

  //player
  const playerPokemonElement = pokemon[0].split(', ')[1].split(': ')[1].toLowerCase();
  const playerPokemonLevel = pokemon[0].split(', ')[0].split(': ')[1];

  //chances
  let playerChances = configChances.default;

  const checkElementplayer = elementsData.find((item) => item.portuguese == playerPokemonElement);

  if (checkElementplayer.strong.includes(enemyElement)) {
    playerChances = playerChances + configChances.elementWinIncrease;
  }

  if (+playerPokemonLevel >= +enemyPokemonLevel) {
    playerChances = playerChances + configChances.levelWinIncrease;
  }

  //field
  let fieldWidth = 0;
  let fieldHeight = 0;

  if (difficulty == 'Facil') {
    fieldWidth = configFieldSize.facil.width;
    fieldHeight = configFieldSize.facil.height;
  }

  if (difficulty == 'Medio') {
    fieldWidth = configFieldSize.medio.width;
    fieldHeight = configFieldSize.medio.height;
  }

  if (difficulty == 'Dificil') {
    fieldWidth = configFieldSize.dificil.width;
    fieldHeight = configFieldSize.dificil.height;
  }

  const totalButtons = fieldWidth * fieldHeight;

  //generates gym leader life
  let leaderArr = [];
  while (leaderArr.length < configGymLeaderLife) {
    let r = (Math.floor(Math.random() * totalButtons) + 1).toString();
    if (leaderArr.indexOf(r) === -1) leaderArr.push(r);
  }
  // console.log(leaderArr);

  //cria linhas
  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();
  const row3 = new ActionRowBuilder();
  const row4 = new ActionRowBuilder();
  const row5 = new ActionRowBuilder();

  const component = [];

  for (i = 1; i <= totalButtons; i++) {
    const button = new ButtonBuilder().setCustomId(`${i}`).setLabel(`${i}`).setStyle(ButtonStyle.Primary);
    if (row1.components.length < fieldWidth) {
      row1.addComponents(button);
    } else if (row2.components.length < fieldWidth) {
      row2.addComponents(button);
    } else if (row3.components.length < fieldWidth) {
      row3.addComponents(button);
    } else if (row4.components.length < fieldWidth) {
      row4.addComponents(button);
    } else if (row5.components.length < fieldWidth) {
      row5.addComponents(button);
    }

    if (i == totalButtons) {
      component.push(row1, row2, row3, row4, row5);
    }
  }

  let filteredComponent = component.filter((item) => item.components != '');

  let selected = [];
  let rightGuess = 0;

  function gameStart() {
    // if (authorTurn == true) {
    interaction.editReply({
      content: ` ${interaction.user} **!** Você tem ${playerChances - selected.length} chances`,
      components: [...filteredComponent],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: configCooldown,
    });

    collector.on('collect', (i) => {
      i.deferUpdate();

      // if (i.user.id == interaction.user.id) {
      const find = leaderArr.includes(i.customId);

      filteredComponent.forEach((item, index) => {
        item.components.forEach((item) => {
          if (item.data.custom_id == i.customId && find) {
            item.setDisabled(true);
            item.setStyle(ButtonStyle.Success);
            rightGuess = rightGuess + 1;
          }
          if (item.data.custom_id == i.customId && !find) {
            item.setDisabled(true);
            item.setStyle(ButtonStyle.Danger);
          }
        });
      });

      if (selected.length < playerChances) {
        selected.push(i.customId);
      }

      interaction.editReply({
        content: `Você tem ${playerChances - selected.length} chances`,
        components: [...filteredComponent],
        ephemeral: true,
      });

      if (rightGuess >= configGymLeaderLife) {
        // interaction.editReply({
        //   content: `Acertou todos`,
        //   components: [],
        // });

        collector.removeAllListeners();
        return getPrizeGymBattle(interaction, difficulty, enemyLeague, enemyBadge);
      }
      if (selected.length >= playerChances) {
        interaction.editReply({
          content: `${interaction.user} Não acertou todos... infelizmente você perdeu a batalha de ginásio`,
          components: [],
        });
        collector.removeAllListeners();
      }
    });

    collector.on('end', (reason) => {
      if (selected.length < configGymLeaderLife && reason == 'time') {
        interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [], ephemeral: true });
      }
    });
  }
  gameStart();

  return await interaction.editReply({
    content: `${interaction.user} Você tem ${playerChances} chances para acertar os **${configGymLeaderLife}** campos de vida adversário`,
    components: [...filteredComponent],
    ephemeral: true,
  });
}

async function createJokenpo(interaction, pokemon) {
  //enemy
  const enemyElement = interaction.message.embeds[0].fields[1].value;
  const difficulty = interaction.message.embeds[0].fields[5].value;
  const enemyPokemonLevel = interaction.message.embeds[0].fields[3].value;
  const enemyLeague = interaction.message.embeds[0].fields[6].value;
  const enemyBadge = interaction.message.embeds[0].fields[2].value;

  //player
  const playerPokemonElement = pokemon[0].split(', ')[1].split(': ')[1].toLowerCase();
  const playerPokemonLevel = pokemon[0].split(', ')[0].split(': ')[1];

  console.log(playerPokemonLevel);
  //chances
  let playerChances = configChances.default;

  const checkElementplayer = elementsData.find((item) => item.portuguese == playerPokemonElement);

  if (checkElementplayer.strong.includes(enemyElement)) {
    playerChances = playerChances + configChances.elementWinIncrease;
  }

  if (+playerPokemonLevel >= +enemyPokemonLevel) {
    playerChances = playerChances + configChances.levelWinIncrease;
  }

  let winChance = 0;
  let drawChance = 0;
  let rightGuess = 0;
  let drawGuess = 0;
  let selected = 0;
  if (difficulty == 'Facil') {
    winChance = configGymJokenpoWinChance.facil.chance;
    drawChance = (100 - winChance) / 2 + winChance;
  }

  if (difficulty == 'Medio') {
    winChance = configGymJokenpoWinChance.medio.chance;
    drawChance = (100 - winChance) / 2 + winChance;
  }

  if (difficulty == 'Dificil') {
    winChance = configGymJokenpoWinChance.dificil.chance;
    drawChance = (100 - winChance) / 2 + winChance;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`Pedra`).setLabel(`Pedra`).setStyle(ButtonStyle.Secondary).setEmoji('✊'),
    new ButtonBuilder().setCustomId(`Papel`).setLabel(`Papel`).setStyle(ButtonStyle.Secondary).setEmoji('🤚'),
    new ButtonBuilder().setCustomId(`Tesoura`).setLabel(`Tesoura`).setStyle(ButtonStyle.Secondary).setEmoji('🖖')
  );

  function gameStart() {
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: configCooldown,
    });

    collector.on('collect', (i) => {
      i.deferUpdate();

      const dice = chance.integer({ min: 1, max: 100 });

      if (selected <= playerChances) {
        selected = selected + 1;
      }

      if (dice <= winChance) {
        rightGuess = rightGuess + 1;
        interaction.editReply({
          content: ` ${interaction.user}**VENCEU!** Você tem ${playerChances - selected} chances`,
          components: [row],
          ephemeral: true,
        });
      } else if (dice > winChance && dice <= drawChance) {
        drawGuess = drawGuess + 1;
        interaction.editReply({
          content: ` ${interaction.user} **EMPATOU!** Você tem ${playerChances - selected} chances`,
          components: [row],
          ephemeral: true,
        });
      } else {
        interaction.editReply({
          content: ` ${interaction.user} **PERDEU...** Você tem ${playerChances - selected} chances`,
          components: [row],
          ephemeral: true,
        });
      }

      if (rightGuess >= 3) {
        collector.removeAllListeners();
        return getPrizeGymBattle(interaction, difficulty, enemyLeague, enemyBadge);
      }

      if (selected >= playerChances) {
        collector.removeAllListeners();
        if (rightGuess == 2 && drawGuess == 1) {
          return getPrizeGymBattle(interaction, difficulty, enemyLeague, enemyBadge);
        }
        interaction.editReply({
          content: `${interaction.user} **PERDEU...** Infelizmente você perdeu a batalha de ginásio...`,
          components: [],
          ephemeral: true,
        });
      }
    });

    collector.on('end', (reason) => {
      if (selected < playerChances && reason == 'time') {
        interaction.editReply({ content: `Não selecionou a quantidade necessária`, components: [], ephemeral: true });
      }
    });
  }
  gameStart();

  return await interaction.editReply({
    content: `${interaction.user} Você tem ${playerChances} chances para vencer os **${configGymLeaderLife}** vidas adversário. Apenas um empate é permitido como excessão.`,
    components: [row],
    ephemeral: true,
  });
}

async function getPrizeGymBattle(interaction, difficulty, gymLeague, gymBadge) {
  const inventory = await Inventory.findOne({ where: { PlayerDiscordId: interaction.user.id } });
  const player = await Player.findOne({ where: { discordId: interaction.user.id } });
  const invJSON = inventory.toJSON();
  const badgeJson = JSON.parse(invJSON.badges);
  const league = badgeJson.find((item) => item.name == gymLeague);
  const badge = league.badges.find((item) => item.name == gymBadge);

  badge.qnt = badge.qnt + 1;

  let prize = '';

  if (difficulty == 'Facil') {
    prize = {
      moedas: invJSON.moedas + configGymPrize.facil.moedas,
      pokeball: invJSON.pokeball + configGymPrize.facil.pokeball,
      greatball: invJSON.greatball + configGymPrize.facil.greatball,
      masterball: invJSON.masterball + configGymPrize.facil.masterball,
      ultraball: invJSON.ultraball + configGymPrize.facil.ultraball,
      itemEvo1: invJSON.itemEvo1 + configGymPrize.facil.itemEvo1,
      itemEvo2: invJSON.itemEvo2 + configGymPrize.facil.itemEvo2,
      exp: configGymPrize.facil.trainerExp,
    };
  }
  if (difficulty == 'Medio') {
    prize = {
      moedas: invJSON.moedas + configGymPrize.facil.moedas,
      pokeball: invJSON.pokeball + configGymPrize.facil.pokeball,
      greatball: invJSON.greatball + configGymPrize.facil.greatball,
      masterball: invJSON.masterball + configGymPrize.facil.masterball,
      ultraball: invJSON.ultraball + configGymPrize.facil.ultraball,
      itemEvo1: invJSON.itemEvo1 + configGymPrize.facil.itemEvo1,
      itemEvo2: invJSON.itemEvo2 + configGymPrize.facil.itemEvo2,
      exp: configGymPrize.facil.trainerExp,
    };
  }
  if (difficulty == 'Dificil') {
    prize = {
      moedas: invJSON.moedas + configGymPrize.facil.moedas,
      pokeball: invJSON.pokeball + configGymPrize.facil.pokeball,
      greatball: invJSON.greatball + configGymPrize.facil.greatball,
      masterball: invJSON.masterball + configGymPrize.facil.masterball,
      ultraball: invJSON.ultraball + configGymPrize.facil.ultraball,
      itemEvo1: invJSON.itemEvo1 + configGymPrize.facil.itemEvo1,
      itemEvo2: invJSON.itemEvo2 + configGymPrize.facil.itemEvo2,
      exp: configGymPrize.facil.trainerExp,
    };
  }

  const expPrize = await checkTrainerLevelUp(player, prize.exp);

  await inventory.update({
    moedas: prize.moedas,
    pokeball: prize.pokeball,
    greatball: prize.greatball,
    masterball: prize.masterball,
    ultraball: prize.ultraball,
    itemEvo1: prize.ItemEvo1,
    itemEvo2: prize.itemEvo2,
    badges: badgeJson,
  });
  await player.update({ trainerLevel: expPrize.trainerLevel, expToNextLevel: expPrize.expToNextLevel });
  return interaction.editReply({
    content: `${interaction.user} Você recebeu como premiação por derrotar o ginásio: 
    **Insíginia: ${gymBadge}**
    Moedas: ${configGymPrize.facil.moedas} 
    Pokeball: ${configGymPrize.facil.pokeball}
    Greatball: ${configGymPrize.facil.greatball}
    Masterball: ${configGymPrize.facil.masterball}
    Ultraball: ${configGymPrize.facil.ultraball}
    Item de Evolução 1: ${configGymPrize.facil.itemEvo1}
    Item de Evolução 2: ${configGymPrize.facil.itemEvo2}`,
    components: [],
  });
}
module.exports = { createBoard, createBoardEvent, createJokenpo };
