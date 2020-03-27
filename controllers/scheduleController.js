const HttpStatus = require('http-status-codes')
const { getSchedule } = require('../utils')

exports.getRoomSchedule = async (req, res) => {
  try {
    const schedule = await getSchedule('./data/schedule.json')
    const schedule2 = await getSchedule('./data/schedule2.json')

    const { r } = req.query

    if (!r) {
      return res.status(HttpStatus.OK).json({
        success: true,
        schedule
      })
    }

    const rooms = r.split(',')
    const sem1 = {}
    const sem2 = {}

    if (schedule) {
      for (const year in schedule) {
        for (const day in schedule[year]) {
          if (!Object.prototype.hasOwnProperty.call(sem1, year)) {
            sem1[year] = {}
          }

          sem1[year][day] = Array.prototype.filter.call(
            schedule[year][day],
            entry => {
              for (const room in rooms) {
                if (entry.Sala === rooms[room]) {
                  return true
                }
              }
              return false
            }
          )

          if (Array.isArray(sem1[year][day]) && sem1[year][day].length === 0) {
            delete sem1[year][day]
          }
        }

        if (Object.keys(sem1[year]).length === 0) {
          delete sem1[year]
        }
      }
    }

    if (schedule2) {
      for (const year in schedule2) {
        for (const day in schedule2[year]) {
          if (!Object.prototype.hasOwnProperty.call(sem2, year)) {
            sem2[year] = {}
          }

          sem2[year][day] = Array.prototype.filter.call(
            schedule[year][day],
            entry => {
              for (const room in rooms) {
                if (entry.Sala === rooms[room]) {
                  return true
                }
              }
              return false
            }
          )

          if (Array.isArray(sem2[year][day]) && sem2[year][day].length === 0) {
            delete sem2[year][day]
          }
        }

        if (Object.keys(sem2[year]).length === 0) {
          delete sem2[year]
        }
      }
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: {
        sem1,
        sem2
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something didn't go well.."
    })
  }
}

exports.getYearSchedule = async (req, res) => {
  try {
    const { yearNumber } = req.params

    const schedule = await getSchedule('./data/schedule.json')
    const schedule2 = await getSchedule('./data/schedule2.json')

    if (!schedule[yearNumber] && !schedule2[yearNumber]) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid year number'
      })
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: { sem1: schedule[yearNumber], sem2: schedule2[yearNumber] }
    })
  } catch (error) {
    console.log(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.getYearSemesterSchedule = async (req, res) => {
  try {
    const { yearNumber, semesterNumber } = req.params
    if (semesterNumber === '1' || semesterNumber === '2') {
      let pathToSchedule = './data/schedule.json'

      if (semesterNumber === '2') pathToSchedule = './data/schedule2.json'

      const schedule = await getSchedule(pathToSchedule)

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
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      success: false,
      message: 'Invalid semester number'
    })
  } catch (error) {
    console.error(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
