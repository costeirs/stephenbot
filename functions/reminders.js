const Reminder = require('../models/reminder')

// For creating a new reminder
exports.create = async (title, date, channel) => {
  var newDate = new Date(date)
  const reminder = new Reminder({title: title, date: newDate, channel: channel})

  await reminder.save()

  return true
}

exports.checkTime = async (dateToCheck) => {
  var query = Reminder.find({date: dateToCheck})
  
  return query
}
