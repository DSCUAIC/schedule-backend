const HttpStatus = require('http-status-codes')
const fs = require('fs').promises

exports.getRoomSchedule = async (req, res) => {
  try {
    return res.status(HttpStatus.OK).json(req.query.r)
  } catch (error) {}
}

exports.getYearSchedule = async (req, res) => {
  try {
    const { yearNumber } = req.params

    let schedule = await fs.readFile('./data/schedule.json')
    schedule = JSON.parse(schedule)

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: schedule[yearNumber]
    })
  } catch (error) {
    console.log(error)
  }
}
