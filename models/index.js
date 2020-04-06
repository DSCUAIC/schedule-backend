const User = require('./user')
const Faculty = require('./faculty')
const Schedule = require('./schedule')
const Year = require('./year')
const Day = require('./day')
const Course = require('./course')

const db = {
  User,
  Faculty,
  Schedule,
  Year,
  Day,
  Course
}

module.exports = db
