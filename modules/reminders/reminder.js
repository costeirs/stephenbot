const mongoose = require('mongoose')

const definition = {
  title: {
    type: String
  },
  date: {
    type: Date
  },
  channel: {
    type: String
  },
  seen: {
    type: Boolean,
    default: false
  },
  every: {
    type: String
  }
}

const options = {
  timestamps: true
}

const reminderSchema = new mongoose.Schema(definition, options)

module.exports = mongoose.model('Reminder', reminderSchema)
