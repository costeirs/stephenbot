module.exports = class Ping {
  // Watch Phrase
  get WatchPhrase () {
    return /^ping$/i
  }

  async fire (message) {
    return message.reply('pong')
  }
}
