const Model = require('./reminder')
const Sugar = require('sugar-date')

module.exports = class Reminders {
  /*
  * What to listen for
  */
  get WatchPhrase () {
    return /^remind(ers?| me | us)?/i
  }

  // Tick will run every 10 seconds
  async tick (bot) {
    var currentDate = new Date()
    currentDate.setSeconds(0)
    currentDate.setMilliseconds(0)

    const results = await Model.find({date: currentDate, seen: false}).exec()

    results.forEach(reminder => {
      console.log('sending notification', reminder._id)
      const channel = bot.channels.get(reminder.channel)
      if (!channel) {
        // @FIXME bug? dm channels do not reopen. ignore for now
        console.error("can't find channel", reminder.channel)

        reminder.seen = true
        return reminder.save()
      }
      channel.send('**REMINDER**\n' + reminder.title + '\n@everyone')

        // mark as seen
      reminder.seen = true
      return reminder.save()
    })
  }

  // When the WatchPhrase was heard, fire() is fired
  async fire (message) {
    console.log('firing reminders')
    // see if we were asked for help, list, etc
    var arg = message.command.replace(this.WatchPhrase, '').trim()
    console.log('arg=', arg)
    if (arg === '' || arg === 'help') {
      return this._help(message)
    }
    if (arg === 'list') {
      return this._list(message)
    }

    // cut off words from the beginning until we get something date looking
    var parts = message.command.split(' ')
    var realdate
    var realdatephrase
    for (var i = 0; i < parts.length; i++) {
      realdatephrase = parts.slice(i).join(' ')
      var testdate = Sugar.Date(realdatephrase, { future: 'true' })
      if (testdate.isValid().raw) {
        realdate = testdate.raw
        break
      }
    }

    if (!realdate) {
      return message.reply("sorry, I couldn't understand the date")
    }

    if (realdate < new Date()) {
      return message.reply("oops, you can't set a reminder in the past")
    }

    realdate.setSeconds(0)
    realdate.setMilliseconds(0)

    var regexphrase = '^remind(?:ers?| me| us)?(?: (?:to|about)?)? (.+?) (?:on |at )?' + realdatephrase + '$'
    var title = message.command.match(new RegExp(regexphrase, 'i'))[1]

    // pass data...
    const data = {'title': title, 'date': realdate}

    return this._create(message, data)
  }

  /**
  * help
  */
  async _help (message) {
    return message.reply('syntax: remind __what__ __when__')
  }

  /**
  * list upcoming reminders in channel
  */
  async _list (message) {
    var channel = message.channel.id

    const reminders = await Model.find({'channel': channel, 'date': {$gt: new Date()}, 'seen': false}).exec()

    if (reminders.length === 0) {
      return message.reply('No upcoming reminders for this channel.')
    }

    var list = 'Reminders currently set for this channel:\n'
    reminders.forEach(reminder => {
      list += reminder.date + ': ' + reminder.title + '\n'
    })
    return message.reply(list)
  }

  /**
  * create new reminder
  */
  async _create (message, data) {
    // save to database
    const reminder = new Model({'title': data.title, 'date': data.date, 'channel': message.channel.id})

    await reminder.save()

    return message.reply('Reminder made for **' + data.title + '** on this channel for **' + data.date + '**')
  }
}
