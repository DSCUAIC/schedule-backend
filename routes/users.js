const router = require('express').Router()
const { userController } = require('../controllers')

const { payloadValidation } = require('../middlewares')
const { updateUser, changePassword, register } = require('../schemas').users

router.get('/', userController.getAllUsers)
router.patch('/', payloadValidation(updateUser), userController.updateUser)
router.patch(
  '/change_password',
  payloadValidation(changePassword),
  userController.changePassword
)
router.post('/', payloadValidation(register), userController.createUser)
module.exports = router
