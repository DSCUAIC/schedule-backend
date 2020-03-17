const router = require('express').Router()
const { scheduleController } = require('../controllers')

router.get('/rooms', scheduleController.getRoomSchedule)

router.get('/year/:yearNumber', scheduleController.getYearSchedule)

module.exports = router
