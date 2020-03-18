const router = require('express').Router()
const { scheduleController } = require('../controllers')

router.get('/rooms', scheduleController.getRoomSchedule)

router.get('/year/:yearNumber', scheduleController.getYearSchedule)

router.get('/year/:yearNumber/semester/:semesterNumber', scheduleController.getYearSemesterSchedule)

module.exports = router
