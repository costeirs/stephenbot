# stephenbot
Automated Nonsense

## The Bot
Extends [discord.js](https://discord.js.org/).

## Running Locally
Fill in .env file and `npm start`

## Contributing
Run `npm run test` to make sure tests pass.

Run `npm run lint` before committing.

## Modules
`modules/{name}/index.js`: entry point for your module.

`async`/`await` is optional but recommended for methods with database operations.
```js
module.exports = class Ping {
  /**
  * Define instance variables in the constructor
  */
  constructor () {
    this._anInstanceVariable = "example"
  }

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
  async tick () {
    // ...
  }

  /**
  * Fires when the WatchPhrase is heard
  */
  async fire (message) {
    message.reply('pong')
  }
}

```
