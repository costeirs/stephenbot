const mongoose = require('mongoose')

const definition = {
  channels: {
    type: [String]
  },
  url: {
    type: String
  },
  title: {
    type: String
  },
  lastStatus: {
    type: Number,
    default: 200
  },
  lastFeedUpdateAt: {
    type: Date
  }
}

const options = {
  timestamps: true
}

const schema = new mongoose.Schema(definition, options)

module.exports = mongoose.model('RSS', schema)
