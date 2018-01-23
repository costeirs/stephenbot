const {Client} = require('discord.js')

module.exports = class Bot extends Client {
  constructor (opts) {
    super(opts)
    this.modules = []
  }

  onready () {
    console.log("I'm ready!")
    this.user.setPresence({ game: { name: 'Node.js ' + process.version, type: 0 } })
  }

  onmessage (message) {
    // make sure we don't reply to our own messages (or other bots)
    if (message.author.bot || message.author.id === this.user.id) {
      return
    }

    // when in a dm with the bot, it is not required to @ the bot
    // when in a public channel, it is required to @ the bot
    var indm = message.channel.type === 'dm'

    var atbot = '<@' + this.user.id + '> '
    var command = message.content

    if (indm) {
      if (command.startsWith(atbot)) {
        command = command.substring(atbot.length)
      }
    } else {
      if (command.startsWith(atbot)) {
        command = command.substring(atbot.length)
      } else {
        return
      }
    }

    // make sure it's not empty
    command = command.trim()
    if (!command) {
      console.log('empty')
      return
    }

    for (var m of this.modules) {
      if (typeof m.WatchPhrase !== 'object' || typeof m.fire !== 'function') {
        // module does not implement WatchPhrase or has no fire method
        continue
      }
      if (m.WatchPhrase.test(command)) {
        // put command into message object
        message.command = command
        message.args = command.replace(m.WatchPhrase, '').trim().split(' ')
        // fire
        Promise.resolve(m.fire(message))
          .catch(e => {
            // catch failed promise (or exception from method thanks to #resolve)
            console.error('error firing module', m.constructor.name, ':', e)
            message.reply('oops, something went wrong.')
          })
          .then(() => {
            if (message.channel.type !== 'dm' && process.env.QUIET && process.env.QUIET === 'true') {
              message.delete()
            }
          })
          .catch(e => {
            console.error("quiet's turned on but I can't actually delete messages", e)
          })
        // only one handler per phrase right now
        return
      }
    }

    // at this point, we've gone through every module but didn't fire anything
    const commandone = command.split(' ')[0]
    message.reply("I don't know what you mean by '" + commandone + "'")
  }

  ontick () {
    for (var m of this.modules) {
      if (typeof m.tick !== 'function') {
        continue
      }
      Promise.resolve(m.tick(this))
        .catch(e => {
          // catch failed promise (or exception from method thanks to #resolve)
          console.error('error ticking module', m.constructor.name, ':', e)
        })
    }
  }
}
