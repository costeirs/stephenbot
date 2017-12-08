const Discord = require('discord.js');
const cron = require('cron').CronJob
const mongoose = require('mongoose')
const reminders = require('./functions/reminders')

// Connect to the database
mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })

// Fail on connection error.
mongoose.connection.on('error', error => { throw error })

const client = new Discord.Client();


// In PROD, settings passed via env vars, not .env file
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
    require('dotenv').config();
}


//Ready message
client.on('ready', () => {
    console.log('I am ready!');
});

//Messaging functionality
client.on('message', message => {
  //First check to see if the message is meant to be a command
  if (message.content.split("")[0] === '$') { 

    if (message.content === 'ping') {
        message.reply('pong');
    }

    //If message is meant to SET a reminder
    //Assuming reminder is '$reminder 12/8/17 11:00 We have a meeting'
    if (message.content.split(" ")[0] === '$reminder') {
      //Get the title, date and channel from the message
      var msg = message.content.split(" ")
      var channel = message.channel.id
      var date = msg[1] + msg[2]
      var title = ''
      for (i = 3; i < msg.length; i++) {
        title += msg[i]
      }
      reminders.create(title, date, channel)
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

//CRON SHIT
new cron('00 * * * * *', () => {
  const date = new Date()

  const data = reminders.checkTime(date)

  if (data) {
    //Loop over the reminders that need to be sent
    data.forEach(reminder => {
      //Send the message to the proper channel
    })
  } else {
    //handle it
  }
})