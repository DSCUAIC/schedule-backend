const router = require('express').Router()
const { authController } = require('../controllers')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/resetPass', authController.resetPass)

module.exports = router
