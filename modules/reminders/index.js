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
    let args = message.command.replace(this.WatchPhrase, '').trim()
    let argfirst = args.split(' ')[0]
    console.log('args=', args, 'arg1=', argfirst)
    if (args === '' || args === 'help') {
      return this._help(message)
    }
    if (args === 'list') {
      return this._list(message)
    }
    if (argfirst === 'delete' || argfirst === 'rm') {
      return this._delete(message)
    }

    let realdate
    let realdatephrase
    try {
      let response = Reminders.parseDatetime(message.command)
      realdate = response.date
      realdatephrase = response.phrase
      console.log('real=', realdate, 'phrase=', realdatephrase)
    } catch (e) {
      console.log('error parsing datetime', e)
      return message.reply(e.message)
    }

    // prepare for regex
    realdatephrase = realdatephrase.replace('/', '\\/')

    let regexphrase = '^remind(?:ers?| me| us)?(?: (?:to|about)?)? (.+?) (?:on |at )?' + realdatephrase + '$'
    let title = message.command.match(new RegExp(regexphrase, 'i'))[1]

    // pass data...
    const data = {'title': title, 'date': realdate}

    return this._create(message, data)
  }

  /**
  * Parse User supplied sentence for date and/or time.
  * Bumps input without time to noon.
  * @returns Date
  */
  static parseDatetime (value) {
    // cut off words from the beginning until we get something date looking

    // @BUG due to Sugar parsing bug, swap 'at noon' for 'at 12:00 pm'
    value = value.replace(/noon$/, '12:00 pm')
    let parts = value.split(' ')
    let realdate
    let realdatephrase
    // Sugar returns in params how specific the datetime was given.
    let realdateparams = {}

    for (let i = 0; i < parts.length; i++) {
      realdatephrase = parts.slice(i).join(' ')
      let testdate = Sugar.Date(realdatephrase, { params: realdateparams })
      if (testdate.isValid().raw) {
        realdate = testdate
        break
      }
    }

    // shortcut
    if (realdatephrase === '12:00 pm') {
      // test again with future:true for "noon" to become the next noon
      realdatephrase = realdatephrase.replace(/12:00 pm$/, 'noon')
      let testdate = Sugar.Date(realdatephrase, { future: true, params: realdateparams })
      if (testdate.isValid().raw) {
        realdate = testdate
      }
    } else if (realdatephrase === parts.join(' ') && parts.length !== 1) {
      // somtimes, Sugar is able to figure out the date immediately when only a date is present
      //  ("we have a meeting on 1/30/2018"), so do an additional check.
      // we ended up with what we started with; try parsing just last part.
      realdatephrase = parts[parts.length - 1]
      let testdate = Sugar.Date(realdatephrase, { params: realdateparams })
      if (testdate.isValid().raw) {
        realdate = testdate
      } else {

      }
    }

    if (!realdate || !realdate.raw) {
      throw new Error("sorry, I couldn't understand the date")
    }

    if (realdate.raw < new Date()) {
      throw new Error("oops, you can't set a reminder in the past")
    }

    /*
    Use specificity from Sugar to adjust time.
    By default, "tomorrow" will become "1/1/2018 12:00:00 AM".
    Since users will /probably/ not appreciate an @everyone at midnight,
     we will detect vague datetimes and adjust them to something tolerable.
    */
    // console.log("realdatephrase", realdatephrase)
    // console.log("parms", realdateparams)
    // console.log("specificity=",realdateparams.specificity)
    // console.log("realdate", realdate)
    // 0. Only month/day
    if ('month' in realdateparams && realdateparams.date && !realdateparams.hour) {
      // console.log("m/d but no hour")
      realdate.set({hour: 12, minute: 0})
    }
    // 1. If unit is available, then "tomorrow" or "in two days" etc
    if (realdateparams.unit && realdateparams.specificity >= 4 && !realdateparams.hour) {
      // console.log("unit but no hour")
      realdate.set({hour: 12, minute: 0})
    }

    realdatephrase = realdatephrase.replace(/12:00 pm$/, 'noon')

    // adjust seconds and ms for simpler cron
    realdate.set({seconds: 0, milliseconds: 0})

    return {date: realdate.raw, phrase: realdatephrase}
  }

  /**
  * help
  */
  async _help (message) {
    return message.reply('syntax: remind __what__ __when__\nremind list\nremind delete __part of title__')
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

  async _delete (message) {
    let phrase = message.command.replace(this.WatchPhrase, '').trim().split(' ').slice(1).join(' ')

    const results = await Model.remove(
      {
        'channel': message.channel.id,
        'title': { '$regex': phrase },
        'seen': false
      }
    ).exec()

    console.log('removed=', results.result)

    if (results.result.n === 0) {
      return message.reply('No reminders found about "' + phrase + '".')
    }

    return message.reply('Deleted ' + results.result.n + ' reminders.')
  }
}
