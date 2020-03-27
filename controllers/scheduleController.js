const HttpStatus = require('http-status-codes')
const { getSchedule } = require('../utils')

exports.getRoomSchedule = async (req, res) => {
  try {
    const schedule = await getSchedule('./data/schedule.json')
    const { r } = req.query
    if (r === undefined) {
      return res.status(HttpStatus.OK).json({
        success: true,
        schedule
      }) // ya gettin all the rooms, man
    }
    const rooms = r.split(',')
    const result = {}
    for (const year in schedule) {
      for (const day in schedule[year]) {
        // create the empty object to add properties to
        if (!Object.prototype.hasOwnProperty.call(result, year)) {
          result[year] = {}
        }

        // creating the list of classes for that day
        result[year][day] = Array.prototype.filter.call(schedule[year][day], entry => {
          for (const room in rooms) {
            if (entry.Sala === rooms[room]) { return true }
          }
          return false
        })

        // if we have no matching classes, we don't want to display this empty array
        if (Array.isArray(result[year][day]) && result[year][day].length === 0) { delete result[year][day] }
      }

      // same goes for the object for the year, though it's very unlikely this ever happens
      if (Object.keys(result[year]).length === 0) { delete result[year] }
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: result
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

exports.getGroupSchedule = async (req, res) => {
  try {
    const { yearNumber, semesterNumber, groupName } = req.params

    if (!['1', '2'].includes(semesterNumber)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid semester number'
      })
    }

    const schedule = await getSchedule(
      `./data/schedule${semesterNumber === '1' ? '' : '2'}.json`
    )

    if (!schedule[yearNumber]) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid year number'
      })
    }

    const classes = {}
    let isGroupNameValid = false

    for (const [weekDay, weekDaySchedule] of Object.entries(
      schedule[yearNumber]
    )) {
      const weekDayClasses = weekDaySchedule.filter(weekDayClass =>
        weekDayClass.Grupa.endsWith(groupName)
      )
      classes[weekDay] = weekDayClasses

      if (!isGroupNameValid && weekDayClasses.length > 0) {
        isGroupNameValid = true
      }
    }

    if (!isGroupNameValid) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid group name'
      })
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: classes
    })
  } catch (err) {
    console.log(err)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
