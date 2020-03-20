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

exports.getGroupSchedule = async (req, res) => {
  try {
    const { yearNumber, semesterNumber, groupName } = req.params;
    
    if(!["1", "2"].includes(semesterNumber)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid semester number'
      })
    }

    const schedule = await getSchedule(`./data/schedule${semesterNumber === "1" ? "" : "2"}.json`)

    if (!schedule[yearNumber]) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid year number'
      })
    }

    let classes = {};
    for(const [weekDay, weekDaySchedule] of Object.entries(schedule[yearNumber])) {
      const weekDayClasses = Array.from(weekDaySchedule).filter(
        weekDayClass => weekDayClass["Grupa"].endsWith(groupName)
      );
      classes[weekDay] = weekDayClasses;
    }

    const daysOn = Object.values(classes).reduce(
      (daysOn, weekDaySchedule) => daysOn += Array.from(weekDaySchedule).length
    , 0)
    
    if(!daysOn) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Invalid group name'
      })
    }
    
    return res.status(HttpStatus.OK).json({
      success: true,
      schedule: classes
    })
  } catch(err) {
    console.log(err)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}