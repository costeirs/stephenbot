const Discord = require('discord.js');
const client = new Discord.Client();

// In PROD, settings passed via env vars, not .env file
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
    require('dotenv').config();
}


client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
    }
});

client.login(process.env.DISCORD_TOKEN);
