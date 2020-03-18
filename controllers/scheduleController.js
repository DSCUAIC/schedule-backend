const HttpStatus = require('http-status-codes')
const { getSchedule } = require('../utils')

exports.getRoomSchedule = async (req, res) => {
  try {
    return res.status(HttpStatus.OK).json(req.query.r)
  } catch (error) {}
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
