// Dependencies
const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
const fs = require('fs')
const mongoose = require('mongoose')
const path = require('path')

// Load configuration
require('dotenv').config()

// This is now the main entry point
async function run () {
  // 0. Check for env vars
  if (!process.env.MONGO_URL) {
    throw new Error('Env var MONGO_URL is required.')
  }
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('Env var DISCORD_TOKEN is required.')
  }

  // 1. Connect to the database
  mongoose.Promise = Promise
  mongoose.connection.on('error', error => { throw error })
  await mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })

  // 2. Login to Discord
  const Bot = new (require('./bot'))()
  Bot.on('ready', Bot.onready)
  Bot.on('message', Bot.onmessage)
  await Bot.login(process.env.DISCORD_TOKEN)

  // 3. Load modules
  const modules = dirs('modules')
  let modulesEnabled = []
  if (process.env.MODULES_ENABLED) {
    modulesEnabled = process.env.MODULES_ENABLED.split(' ')
  } else {
    modulesEnabled = modules
  }
  if (modulesEnabled.length === 0) {
    throw new Error('You need at least one module enabled.')
  }
  for (var module of modules) {
    if (!(modulesEnabled.includes(module))) {
      console.log('Skipping module', module)
      continue
    }
    console.log('Loading module', module)
    Bot.modules.push(new (require('./modules/' + module))())
  }
  console.log('modules=', Bot.modules)

  // 4. Start cron
  setInterval(function () { Bot.ontick() }, 10 * 1000)

  // All done
  console.log('Booted.')

  // Handle stopping properly
  process.on('SIGINT', function () {
    console.log('graceful shutdown')
    Bot.destroy()
    process.exit()
  })
}
run().catch(e => {
  console.error(e)
  process.exit(1)
})
