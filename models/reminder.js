const mongoose = require('mongoose')

//Assuming reminder is '$remind channel 12/8/17 11:00 We have a meeting'
const definition = {
  title: {
    type: String
  },
  date: {
    type: Date
  },
  channel: {
    type: String
  }
}

const options = {
  timestamps: true
}

const reminderSchema = new mongoose.Schema(definition, options)

module.exports = mongoose.model('Reminder', reminderSchema)