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
    req.log.error(`Unable to getroom schedule -> ${error}`)
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
        (weekDayClass.Tip === 'Curs' && weekDayClass.Grupa.indexOf(groupName.substring(0, groupName.length - 1)) !== -1) || weekDayClass.Grupa.indexOf(groupName) !== -1
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
  } catch (error) {
    req.log.error(`Unable to get group schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

const daysRo = {
  1: 'Luni',
  2: 'Marti',
  3: 'Miercuri',
  4: 'Joi',
  5: 'Vineri',
  6: 'Sambata',
  7: 'Duminica'
}

exports.getScheduleWithParams = async (req, res) => {
  try {
    const schedule = await getSchedule('./data/schedule.json')
    const schedule2 = await getSchedule('./data/schedule2.json')

    const { faculty, semester, year, group, semiyear, room } = req.query
    let dayNum = req.query.day

    // if no params send the entire schedule
    if (!faculty && !semester && !year && !dayNum && !group && !semiyear && !room) {
      return res.status(HttpStatus.OK).json({
        success: true,
        schedule: {
          FII: {
            sem1: schedule,
            sem2: schedule2
          }
        }
      })
    }

    // temporary until the new schedule structure
    if (faculty && faculty !== 'FII') {
      return res.status(HttpStatus.OK).json({
        success: true,
        schedule: {}
      })
    }

    let ret = {}
    ret.FII = {
      sem1: schedule,
      sem2: schedule2
    }

    // filters the semester
    if (semester) {
      if (semester !== '1' && semester !== '2') {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Invalid semester number'
        })
      }
      if (semester === '1') {
        for (const fac in ret) {
          delete ret[fac].sem2
        }
      } else {
        for (const fac in ret) {
          delete ret[fac].sem1
        }
      }
    }

    // filters the year
    if (year) {
      const years = year.split(',')
      for (const fac in ret) {
        for (const sem in ret[fac]) {
          for (const y in ret[fac][sem]) {
            if (!years.includes(y)) {
              delete ret[fac][sem][y]
            }
          }
        }
      }
    }

    // filters the day
    if (dayNum) {
      const days = dayNum.split(',')
      const daysText = []
      for (let index = 0; index < days.length; index++) {
        if (daysRo[days[index]] === undefined) {
          days.splice(index, 1)
          index--
        } else {
          daysText.push(daysRo[days[index]])
        }
      }
      if (days.length === 0) {
        dayNum = ''
      } else {
        for (const fac in ret) {
          for (const sem in ret[fac]) {
            for (const y in ret[fac][sem]) {
              for (const d in ret[fac][sem][y]) {
                if (!daysText.includes(d)) {
                  delete ret[fac][sem][y][d]
                }
              }
            }
          }
        }
      }
    }

    // filters the semiyear
    if(semiyear){

      const semiyears = semiyear.split(',')
      
      // first healthy check
      for(const i in semiyears){
        if(semiyears[i] != 'A' && semiyears[i] != 'B' && semiyears[i] != 'E')
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Bad semiyear provided. Only A, B and E are accepted, with a comma to separate them if the case.'
          })
      }
      for(const fac in ret){
        for(const sem in ret[fac]){
          for(const year in ret[fac][sem]){
            for(const day in ret[fac][sem][year]){
              ret[fac][sem][year][day] = ret[fac][sem][year][day].filter( course => {
                for(const y in semiyears){
                  if(course.Grupa.indexOf(semiyears[y]) !== -1)
                    return true
                }
                return false
              })
            }
          }
        }
      }
    }
    

    // filters the group
    if(group){

      const groups = group.split(',')

      // check if valid group
      for(const i in groups){
        if(isNaN(groups[i]))
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Bad group number provided. Only numbers are allowed.'
          })
      }

      for(const fac in ret){
        for(const sem in ret[fac]){
          for(const year in ret[fac][sem]){
            for(const day in ret[fac][sem][year]){
              ret[fac][sem][year][day] = ret[fac][sem][year][day].filter( course => {
                for(const y in groups){
                  if(course.Grupa.indexOf('A' + groups[y]) !== -1 || course.Grupa.indexOf('B' + groups[y]) !== -1 || course.Grupa.indexOf('E' + groups[y]) !== -1 || course.Tip === 'Curs')
                    return true
                }
                return false
              })
            }
          }
        }
      }

    }

    // filters the room
    if(room){
      const rooms = room.split(',')

      for(const fac in ret){
        for(const sem in ret[fac]){
          for(const year in ret[fac][sem]){
            for(const day in ret[fac][sem][year]){
              ret[fac][sem][year][day] = ret[fac][sem][year][day].filter( course => {
                for(const y in rooms){
                  if(course.Sala.indexOf(rooms[y]) !== -1)
                    return true
                }
                return false
              })
            }
          }
        }
      }

    }

    // removes day key from ret if parameter is set and doesn't contain a comma
    if (dayNum && dayNum.split(',').length === 1) {
      for (const fac in ret) {
        for (const sem in ret[fac]) {
          for (const y in ret[fac][sem]) {
            ret[fac][sem][y] = ret[fac][sem][y][daysRo[dayNum]]
          }
        }
      }
    }

    // removes year key from ret if parameter is set and doesn't contain a comma
    if (year && year.split(',').length === 1) {
      for (const fac in ret) {
        for (const sem in ret[fac]) { ret[fac][sem] = ret[fac][sem][year] }
      }
    }

    // removes sem1/2 key from ret if parameter is set
    if (semester) {
      if (semester === '1') {
        for (const fac in ret) { ret[fac] = ret[fac].sem1 }
      } else {
        for (const fac in ret) { ret[fac] = ret[fac].sem2 }
      }
    }

    // removes faculty key from ret if parameter is set and doesn't contain a comma
    if (faculty && faculty.split(',').length === 1) { ret = ret[faculty] }

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: ret
    })
  } catch (error) {
    req.log.error(`Unable to get parameterized schedule -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
