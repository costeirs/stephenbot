/* eslint-env mocha */
const assert = require('assert')
const forEach = require('mocha-each')

var Reminders = require('./')

// Tests
describe('Reminders', () => {
  describe('parseDatetime()', () => {
    const correct = new Date(Date.UTC(2018, 0, 30, 18, 0, 0, 0))
    const tomorrow = new Date(Date.UTC(2018, 0, 22, 18, 0, 0, 0))

    forEach([
      ['1/30', correct],
      ['1/30/18', correct],
      ['1/30 at noon', correct],
      ['1/30 at 12:00 pm', correct],

      ['1/30/18 at noon', correct],
      ['1/30/18 at 12:00 pm', correct],

      ['tomorrow', tomorrow],
      ['tomorrow at noon', tomorrow]
      // ['Monday', '']
    ])
    .it('parses "%s" then returns "%s"', (test, expected) => {
      let result = Reminders.parseDatetime(test).date
      assert.equal(result.toUTCString(), expected.toUTCString())
    })

    context('with invalid datetime', () => {
      forEach([
        ['1/1/17'],
        ['yesterday'],
        ['    ']
      ])
      .it('parses "%s" and throws exception', (test) => {
        assert.throws(() => Reminders.parseDatetime(test), Error)
      })
    })

    // message.command gets passed in sans the trigger word (ie 'remind')
    context('with example sentences', () => {
      const inOneMin = new Date()
      inOneMin.setTime(inOneMin.getTime() + (60 * 1000))
      inOneMin.setSeconds(0)
      inOneMin.setMilliseconds(0)

      const todayNoon = new Date()
      todayNoon.setHours(18, 0, 0, 0)

      console.log((new Date()).getHours() < 12 ? 'today noon' : 'tomorrow')

      forEach([
        [
          'we have a meeting on 1/30/18',
          {date: correct, phrase: '1/30/18'}
        ],
        [
          // method swaps out noon for 12:00 pm b/c Sugar parsing bug
          'we have a meeting on 1/30/18 at noon',
          {date: correct, phrase: '1/30/18 at noon'}
        ],
        [
          'we have a meeting tomorrow',
          {date: tomorrow, phrase: 'tomorrow'}
        ],
        [
          'we have a meeting at noon tomorrow',
          {date: tomorrow, phrase: 'noon tomorrow'}
        ],
        [
          'we have a meeting at noon',
          {date: ((new Date()).getHours() < 12 ? todayNoon : tomorrow), phrase: 'noon'}
        ],
        [
          'blah blah blah asdf in one minute',
          {date: inOneMin, phrase: 'in one minute'}]
      ])
      .it('parses sentence "%s" correctly', (test, expected) => {
        let result = Reminders.parseDatetime(test)
        // fix dates
        expected.date = expected.date.toUTCString()
        result.date = result.date.toUTCString()
        // test
        assert.deepEqual(result, expected)
      })
    })
  })
})
