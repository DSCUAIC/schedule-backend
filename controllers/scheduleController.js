const HttpStatus = require('http-status-codes')
const { getSchedule, filterSchedule } = require('../utils')

exports.getProfessorSchedule = async (req, res) => {
  try {
    const professors = req.query.name

    const sem1 = {}
    const sem2 = {}

    const schedule1 = await req.db.Schedule.findOne({ semester: 1 })
    const schedule2 = await req.db.Schedule.findOne({ semester: 2 })

    for (const year of schedule1.years) {
      sem1[year.year] = {}

      for (const day of year.days) {
        sem1[year.year][day.name] = []

        for (const course of day.courses) {
          if (Array.isArray(professors)) {
            for (const prof of professors) {
              if (course.professor.includes(prof)) {
                sem1[year.year][day.name].push(course)
              }
            }
          } else {
            if (course.professor.includes(professors)) {
              sem1[year.year][day.name].push(course)
            }
          }
        }

        if (sem1[year.year][day.name].length === 0) {
          delete sem1[year.year][day.name]
        }
      }

      if (Object.keys(sem1[year.year]).length === 0) {
        delete sem1[year.year]
      }
    }

    for (const year of schedule2.years) {
      sem2[year.year] = {}

      for (const day of year.days) {
        sem2[year.year][day.name] = []

        for (const course of day.courses) {
          if (Array.isArray(professors)) {
            for (const prof of professors) {
              if (course.professor.includes(prof)) {
                sem2[year.year][day.name].push(course)
              }
            }
          } else {
            if (course.professor.includes(professors)) {
              sem2[year.year][day.name].push(course)
            }
          }
        }

        if (sem2[year.year][day.name].length === 0) {
          delete sem2[year.year][day.name]
        }
      }

      if (Object.keys(sem2[year.year]).length === 0) {
        delete sem2[year.year]
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
    req.log.error(`Unable to get professor schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

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
    req.log.error(`Unable to getroom schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
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
    req.log.error(`Unable to get year schedule -> ${error}`)
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
    req.log.error(`Unable to get semester schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.getGroupSchedule = async (req, res) => {
  try {
    const {
      facultyShortName,
      yearNumber,
      semesterNumber,
      groupName
    } = req.params

    const semiyear = groupName[0]
    const group = groupName[1]

    const q = { shortName: facultyShortName || 'FII' }

    if (!['1', '2'].includes(semesterNumber)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid semester number'
      })
    }

    const excluded = {}

    if (semesterNumber) {
      if (!['1', '2'].includes(semesterNumber)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid semester'
        })
      }
      excluded[`sem${3 - semesterNumber}Schedule`] = 0
    }

    const schedule = await req.db.Faculty.findOne(q, excluded)

    if (!schedule) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid query'
      })
    }

    if (schedule.sem1Schedule) {
      schedule.sem21chedule.years = filterSchedule({
        schedule: schedule.sem1Schedule,
        year: yearNumber,
        group,
        semiyear
      })
    }

    if (schedule.sem2Schedule) {
      schedule.sem2Schedule.years = filterSchedule({
        schedule: schedule.sem2Schedule,
        year: yearNumber,
        group,
        semiyear
      })
    }

    return res.status(HttpStatus.OK).json({ success: true, schedule })
  } catch (error) {
    req.log.error(`Unable to get group schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.getScheduleWithParams = async (req, res) => {
  try {
    let { faculty, semester, year, group, semiyear, room, day } = req.query

    year = year ? year.split(',') : undefined
    group = group ? group.split(',') : undefined
    semiyear = semiyear ? semiyear.split(',') : undefined
    room = room ? room.split(',') : undefined
    day = day ? day.split(',') : undefined

    const q = { shortName: faculty || 'FII' }

    const excluded = {}

    if (semester) {
      if (!['1', '2'].includes(semester)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid semester'
        })
      }
      excluded[`sem${3 - semester}Schedule`] = 0
    }

    const schedule = await req.db.Faculty.findOne(q, excluded)

    if (!schedule) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid query'
      })
    }

    if (schedule.sem1Schedule) {
      schedule.sem21chedule.years = filterSchedule({
        schedule: schedule.sem1Schedule,
        year,
        group,
        semiyear,
        room,
        day
      })
    }

    if (schedule.sem2Schedule) {
      schedule.sem2Schedule.years = filterSchedule({
        schedule: schedule.sem2Schedule,
        year,
        group,
        semiyear,
        room,
        day
      })
    }

    return res.status(HttpStatus.OK).json({ success: true, schedule })
  } catch (error) {
    req.log.error(`Unable to get parameterized schedule -> ${error}`)

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
