module.exports = class Help {
  // Watch Phrase
  get WatchPhrase () {
    return /^help$/i
  }

  async fire (message) {
    var str = 'Available commands: ' + message.client.modules.map(m => m.constructor.name).join(', ')
    return message.reply(str)
  }
}
