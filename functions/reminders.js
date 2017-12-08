const Reminder = require('../models/reminder')

// For creating a new reminder
exports.create = async (title, date, channel) => {
  var newDate = new Date(date)
  const reminder = new Reminder({title: title, date: newDate, channel: channel})

  await reminder.save()

  return true
}

exports.checkTime = (dateToCheck) => {
  Reminder.find({'date': dateToCheck}).then(reminder => {
    if (reminders) {
      return reminders
    } else {
      return null
    }
  })
}