const HttpStatus = require('http-status-codes')
const fs = require('fs').promises

exports.getRoomSchedule = async (req, res) => {
  try {
    return res.status(HttpStatus.OK).json(req.query.r)
  } catch (error) {}
}

exports.getYearSemesterSchedule = async (req, res) => {
  try {
    const yearNumber = req.params.yearNumber
    const semesterNumber = req.params.semesterNumber

    let schedule = await fs.readFile(`./data/schedule${semesterNumber}.json`)
    schedule = JSON.parse(schedule)

    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: schedule[yearNumber]
    })
  } catch (error) {
    console.log(error)
  }
}
