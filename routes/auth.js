const router = require('express').Router()
const { authController } = require('../controllers')

const { payloadValidation } = require('../middlewares')
const { login, register, forgotPassword, validate } = require('../schemas').auth

router.post('/login', payloadValidation(login), authController.login)
router.post('/register', payloadValidation(register), authController.register)
router.post('/validate', payloadValidation(validate), authController.validate)
router.post(
  '/forgot_password',
  payloadValidation(forgotPassword),
  authController.forgotPassword
)

module.exports = router
