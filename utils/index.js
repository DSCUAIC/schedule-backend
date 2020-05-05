const jwt = require('jsonwebtoken')
const fs = require('fs').promises

const constants = require('./constants')
exports.constants = constants

const { idClaim } = constants

exports.createTkn = (payload = {}, secret) => {
  payload[idClaim] = payload._id || null
  delete payload._id
  delete payload.password

  if (payload.exp === null) {
    delete payload.exp
    return jwt.sign(payload, secret)
  }

  if (payload.exp !== undefined || Number.isInteger(payload.exp)) {
    return jwt.sign(payload, secret)
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

exports.decodeTkn = (token, secret) => jwt.verify(token, secret)

exports.getEvenToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  }

  if (req.params && req.params.token) {
    return req.params.token
  }

  return null
}

exports.getSchedule = async path => {
  try {
    const schedule = await fs.readFile(path)

    return JSON.parse(schedule)
  } catch (error) {
    return null
  }
}

exports.filterSchedule = ({ schedule, year, group, semiyear, room, day }) => {
  return schedule.years.filter(y => {
    if (year && !year.includes(y.year.toString())) {
      return false
    }

    y.days = y.days.filter(d => {
      if (day && !day.includes(d.name)) {
        return false
      }

      d.courses = d.courses.filter(course => {
        if (room && !room.includes(course.room)) {
          return false
        }

        const groups = course.group.split(' , ').map(c => c.slice(2))

        return groups.some(c => {
          if (!c.length || (!group && !semiyear)) {
            return true
          }

          if (c.length === 1) {
            if (!semiyear) {
              return true
            }

            return semiyear.includes(c)
          }

          if (c.length === 2) {
            if (semiyear && group) {
              return semiyear.includes(c[0]) && group.includes(c[1])
            } else if (semiyear) {
              return semiyear.includes(c[0])
            } else if (group) {
              return group.includes(c[1])
            }
          }
        })
      })

      return true
    })

    return true
  })
}
