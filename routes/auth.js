const router = require('express').Router()
const { authController } = require('../controllers')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/reset_password', authController.resetPass)

module.exports = router
