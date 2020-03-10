const router = require('express').Router()
const { scheduleController } = require('../controllers')

router.get('/rooms', scheduleController.getRoomSchedule)

module.exports = router
