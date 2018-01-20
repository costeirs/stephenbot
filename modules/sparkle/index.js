module.exports = class Sparkle {
  // Watch Phrase
  get WatchPhrase () {
    return /^sparkle\b/i
  }

  async fire (message) {
    console.log('sparkling')
    const sparkles = [
        ['✧･ﾟ: *✧･ﾟ:* ', ' *:･ﾟ✧*:･ﾟ✧'],
        ['｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ', ' ｡･:*:･ﾟ★,｡･:*:･ﾟ☆'],
        ['☆♬○♩●♪✧♩ ', ' ♩✧♪●♩○♬☆'],
        ['*＊✿❀ ', ' ❀✿＊*'],
        ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ', ''],
        ['(☞ﾟ∀ﾟ)☞', '']
    ]
    let sparkle = sparkles[Math.floor(Math.random() * sparkles.length)]
    let sentence = message.command.replace(this.WatchPhrase, '').trim()
    let response = sparkle[0] + sentence + sparkle[1]

    return message.reply(response)
  }
}
