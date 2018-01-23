// Generic responses, per Jordan
module.exports = class Hello {
  get WatchPhrase () {
    return /^(hi|hey|hello|yo|sup|(good|bad) bot)/i
  }

  async fire (message) {
    if (/^(hi|hey|hello|yo|sup)/i.test(message.command)) {
      return message.reply('Olá')
    } else if (/^(good|bad) bot/i.test(message.command)) {
      if (message.command.split(' ')[0].toLowerCase() === 'good') {
        return message.reply('（´・ω・｀）')
      } else {
        return message.reply('（ ´,_ゝ`) ')
      }
    }
  }
}
