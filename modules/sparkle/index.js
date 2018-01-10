module.exports = class Sparkle {
  // Watch Phrase
  get WatchPhrase () {
    return /^sparkle\b/i
  }

  fire (message) {
    console.log('sparkling')
    const sparkles = [
        ['✧･ﾟ: *✧･ﾟ:* ', ' *:･ﾟ✧*:･ﾟ✧'],
        ['｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ', ' ｡･:*:･ﾟ★,｡･:*:･ﾟ☆'],
        ['☆♬○♩●♪✧♩ ', ' ♩✧♪●♩○♬☆'],
        ['*＊✿❀ ', ' ❀✿＊*'],
        ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ', '']
    ]
    let sparkle = sparkles[Math.floor(Math.random() * sparkles.length)]
    let sentence = message.command.replace(this.WatchPhrase, '').trim()
    let response = sparkle[0] + sentence + sparkle[1]

    message.reply(response)
  }
}
