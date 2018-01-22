const FeedParser = require('feedparser-promised')
const Model = require('./rssfeed')
const URL = require('valid-url')

module.exports = class RSS {
  constructor () {
    this._nextTick = 0
  }

  /*
  * What to listen for
  */
  get WatchPhrase () {
    return /^rss\b/i
  }

  // When the WatchPhrase was heard, fire() is fired
  async fire (message) {
    console.log('rss firing')
    // see if we were asked for help, list, etc
    message.args = message.command.replace(this.WatchPhrase, '').trim().split(' ')
    const action = message.args[0] || ''
    console.log('action=', action)
    if (action === 'list') {
      return this._list(message)
    }
    if (message.args.length === 2) {
      if (action === 'add') {
        return this._add(message)
      } else if (action === 'delete' || action === 'remove' || action === 'rm') {
        return this._delete(message)
      }
    }
    return this._help(message)
  }

  async tick (bot) {
    // since bot will tick every 10 seconds, we need to keep track of when to actually tick next
    // eg, only actually tick every five minutes
    let now = Date.now()
    if (now < this._nextTick) {
      return
    }
    this._nextTick = now + (5 * 60 * 1000)
    //
    // get all feeds
    const feeds = await Model.find(
      {
        lastStatus: {
          '$gte': 200, // any OK or redirect status
          '$lt': 400
        },
        channels: { $gt: [] }
      }
    ).exec()
    feeds.forEach(feed => {
      // get
      FeedParser.parse({uri: feed.url}).then((items) => {
        if (items.length === 0) {
          throw new Error('rss feed ' + feed.url + ' items.length is 0')
        }
        // notify
        const meta = items[0].meta
        if (!meta.date) {
          throw new Error('rss feed ' + feed.url + ' has no date field')
        }
        if (meta.date.getTime() <= feed.lastFeedUpdateAt.getTime()) {
          return
        }
        console.log('rss feed', feed.title, 'updated')

        feed.channels.forEach(channel => {
          const c = bot.channels.get(channel)
          if (!c) {
            console.error("can't find channel", channel)
            return
          }
          c.send('RSS: ' + feed.title + ':\n**' + items[0].title + '**\n' + items[0].link)
        })

        // update feed last update time
        feed.lastFeedUpdateAt = Date.now()
        feed.save()
      }).catch((error) => {
        console.error('error pulling feed: ', error)
        feed.lastStatus = 500 // @FIXME
        feed.save()
      })
    })
  }

  /**
  * help
  */
  async _help (message) {
    return message.reply('syntax: rss list/(add/remove __url__)')
  }

  /**
  * Save feed
  * If feed is already being tracked, channel id will be added
  */
  async _add (message) {
    const url = message.args[1]
    const channelid = message.channel.id

    // check that we were given a URL
    if (!URL.isWebUri(url)) {
      return message.reply('Not a valid URL')
    }

    const feed = await Model.find({'url': url}).exec()

    // see if url is already tracked
    if (feed.length === 0) {
      // new feed to track
      FeedParser.parse({uri: url}).then((items) => {
        if (items.length === 0) {
          throw new Error('rss feed ' + url + ' contains no items')
        }
        const meta = items[0].meta
        if (!meta.date) {
          throw new Error('rss feed ' + url + ' has no date field')
        }
        const feed = new Model({'title': meta.title, 'channels': [channelid], 'url': url, 'lastFeedUpdateAt': meta.date})
        feed.save()

        message.reply('Now following ' + meta.title)
      }).catch((error) => {
        console.error('error: ', error)
        message.reply('Error adding feed: ' + error)
      })
    } else if (feed[0].channels.includes(channelid)) {
      // make sure we don't double track
      return message.reply('This channel is already following that feed.')
    } else {
      // already being tracked by a different channel, so add this channel
      await Model.update(
        { _id: feed[0]._id },
        { $push: { channels: channelid } }
      )
      return message.reply('Now following ' + feed[0].title)
    }
  }

  async _delete (message) {
    const url = message.args[1]
    const channelid = message.channel.id

    console.log('rss deleting', url)

    const feed = await Model.find({'url': url}).exec()

    // see if url is already tracked
    if (feed.length === 0) {
      return message.reply("This channel isn't following that feed.")
    }
    // remove channel from feed
    return Model.update(
      { _id: feed[0]._id },
      { $pull: { channels: channelid } }
    )
  }

  async _list (message) {
    const channelid = message.channel.id
    // get all feeds for this channel
    const feeds = await Model.find(
      {
        channels: { $in: [channelid] }
      }
    ).exec()

    if (feeds.length === 0) {
      message.reply("This channel isn't following any feeds.")
      return
    }

    let messages = feeds.map(feed => {
      let message = '**' + feed.title + '**\n' + feed.url
      if (feed.lastStatus >= 400) {
        message += '  Last fetch returned error.'
      }
      return message
    })

    messages = '\n' + messages.join('\n')

    return message.reply(messages)
  }
}
