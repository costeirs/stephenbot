module.exports = class Ping {
  // Watch Phrase
  get WatchPhrase () {
    return /^ping$/i
  }

  fire (message) {
    message.reply('pong')
  }
}
