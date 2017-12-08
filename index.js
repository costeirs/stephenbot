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
      var channel = message.channel.id
      var msg = message.content.split(" ") //blow that boi up
      var date = msg[1] + " " + msg[2] //the date are the first 2 args
      var title = '' //we gonna build this boi
      for (i = 3; i < msg.length; i++) {
        title += msg[i] + " " //build it
      }
      console.log(title)
      console.log(date)
      console.log(channel)
      if (reminders.create(title, date, channel)) { //If the create is a success
        console.log("Created Reminder " + title + ', ' + date + ', ' + channel) //log it
        client.channels.get(channel).send("Reminder made for **" + title + "** on this channel for **" + date + '**') //just send it
      }
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
      console.log("Sending reminder for: " + reminder.title + " to: " + reminder.channel)
      //Send the message to the proper channel
      client.channels.get(reminder.channel).send("**REMINDER** \n" + reminder.message + "\n @everyone")
    })
  } else {
    //handle it
  }
})