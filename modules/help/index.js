module.exports = class Help {
  // Watch Phrase
  get WatchPhrase () {
    return /^help$/i
  }

  fire (message) {
    var str = 'Available commands: ' + message.client.modules.map(m => m.constructor.name).join(', ')
    message.reply(str)
  }
}
