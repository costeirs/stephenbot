# stephenbot
Automated Nonsense

## The Bot
Extends [discord.js](https://discord.js.org/).

## Contributing
1. fill in .env file
2. Run `npm run lint` before committing

## Modules
`modules/{name}/index.js`: entry point for your module
```js
module.exports = class Ping {
  /**
  * Regex to match incoming messages against.
  * The user's message, minus the bot's name, will be tested against the regex.
  */
  get WatchPhrase () {
    return /^ping$/
  }

  /**
  * Fires every 10 seconds
  */
  tick () {
    // ...
  }

  /**
  * Fires when the WatchPhrase is heard
  */
  fire (message) {
    message.reply('pong')
  }
}

```
