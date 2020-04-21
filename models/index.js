const User = require('./user')
const Faculty = require('./faculty')
const Schedule = require('./schedule')
const Year = require('./year')
const Day = require('./day')
const Course = require('./course')
const Secret = require('./secret')

const db = {
  User,
  Faculty,
  Schedule,
  Year,
  Day,
  Course,
  Secret
}

module.exports = db
