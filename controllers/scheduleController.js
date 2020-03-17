const HttpStatus = require('http-status-codes')
const fs = require('fs')
const { getSchedule } = require('../utils')

exports.getRoomSchedule = async (req, res) => {
  try {
    const orar = JSON.parse(fs.readFileSync('./data/schedule.json'))
    if (req.query.r === undefined) {
      return res.status(HttpStatus.OK).send(orar) // ya gettin all the rooms, man
    }
    const rooms = req.query.r.split(',')
    console.log(rooms)
    const result = {}
    for (const an in orar) {
      for (const zi in orar[an]) {
        for (const entry in orar[an][zi]) {
          for (const room in rooms) {
            if (orar[an][zi][entry].Sala === rooms[room]) {
              if (!Object.prototype.hasOwnProperty.call(result, an)) {
                result[an] = {}
              }
              if (!Object.prototype.hasOwnProperty.call(result, zi) && !Array.isArray(result[an][zi])) {
                result[an][zi] = []
              }
              result[an][zi].push(orar[an][zi][entry])
            }
          }
        }
      }
    }

    return res.status(HttpStatus.OK).json(result)
  } catch (error) {
    return res.send(error)
  }
}

exports.getYearSchedule = async (req, res) => {
  try {
    const { yearNumber } = req.params

    const schedule = await getSchedule('./data/schedule.json')

    if (!schedule[yearNumber]) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid year number'
      })
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: schedule[yearNumber]
    })
  } catch (error) {
    console.log(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
