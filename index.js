require('dotenv').config();
const fs = require('fs');
const path = require('path');
const conn = require('./db/conn.js');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { TOKEN } = process.env;

// Cria uma nova instância do client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Cria as coleções
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

/*
 *********** Handler Comandos *******
 */
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

/*
 *********** Handler Eventos *******
 */
const eventsPath = path.join(__dirname, './functions/events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

/*
 *********** Handler Eventos *******
 */
const componentsPath = path.join(__dirname, 'components');
const componentsFolders = fs.readdirSync(componentsPath);

for (const folder of componentsFolders) {
  const componentsFilesPath = path.join(componentsPath, folder);

  const componentsFiles = fs.readdirSync(componentsFilesPath).filter((file) => file.endsWith('.js'));

  switch (folder) {
    case 'buttons':
      for (const file of componentsFiles) {
        const filePath = path.join(componentsFilesPath, file);
        const button = require(filePath);
        client.buttons.set(button.data.name, button);
      }

      const subFolders = fs
        .readdirSync(componentsFilesPath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      for (const folder of subFolders) {
        const folderPath = path.join(componentsFilesPath, folder);

        const componentsFilesSubFolder = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));

        for (const file of componentsFilesSubFolder) {
          const filePath = path.join(folderPath, file);
          const button = require(filePath);
          client.buttons.set(button.data.name, button);
        }
      }

    case 'modals':
      for (const file of componentsFiles) {
        const filePath = path.join(componentsFilesPath, file);
        const modal = require(filePath);
        client.modals.set(modal.data.name, modal);
      }
      break;
    case 'selectMenus':
      const subFoldersSelect = fs
        .readdirSync(componentsFilesPath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      for (const folder of subFoldersSelect) {
        const folderPath = path.join(componentsFilesPath, folder);

        const componentsFilesSubFolder = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));

        for (const file of componentsFilesSubFolder) {
          const filePath = path.join(folderPath, file);
          const menu = require(filePath);
          client.selectMenus.set(menu.data.name, menu);
        }
      }

      for (const file of componentsFiles) {
        const filePath = path.join(componentsFilesPath, file);
        const menu = require(filePath);
        client.selectMenus.set(menu.data.name, menu);
      }
      break;
  }
}

/*****
 *
 * Conectar banco de dados
 *
 *****/
conn
  .sync()
  .then(console.log('Conectado ao banco de dados Agumon2'))
  .catch((err) => console.log(err));

//
client.login(TOKEN);
