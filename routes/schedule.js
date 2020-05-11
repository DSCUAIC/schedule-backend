const router = require('express').Router()
const { scheduleController } = require('../controllers')

router.get('/', scheduleController.getScheduleWithParams)

router.get('/rooms', scheduleController.getRoomSchedule)

router.get('/year/:yearNumber', scheduleController.getYearSchedule)

router.get(
  '/faculty/:facultyShortName/year/:yearNumber/semester/:semesterNumber/group/:groupName',
  scheduleController.getGroupSchedule
)

router.get(
  '/year/:yearNumber/semester/:semesterNumber',
  scheduleController.getYearSemesterSchedule
)

router.get('/professors', scheduleController.getProfessorSchedule)

module.exports = router
