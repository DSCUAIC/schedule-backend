const HttpStatus = require('http-status-codes')
const fs = require('fs').promises

const getSchedule = async path => {
  const schedule = await fs.readFile(path)
  return JSON.parse(schedule)
}

exports.getRoomSchedule = async (req, res) => {
  try {
    return res.status(HttpStatus.OK).json(req.query.r)
  } catch (error) {}
}

exports.getYearSchedule = async (req, res) => {
  try {
    const { yearNumber } = req.params

    const schedule = await getSchedule('./data/schedule.json')

    if (schedule[yearNumber]) {
      return res.status(HttpStatus.OK).json({
        success: true,
        schedule: schedule[yearNumber]
      })
    } else {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid year number'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}
