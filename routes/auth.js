const router = require('express').Router()
const { authController } = require('../controllers')

const { payloadValidation } = require('../middlewares')
const { login, register } = require('../schemas').auth

router.post('/login', payloadValidation(login), authController.login)
router.post('/register', payloadValidation(register), authController.register)

module.exports = router
