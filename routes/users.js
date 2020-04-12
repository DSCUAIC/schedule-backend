const router = require('express').Router()
const { userController } = require('../controllers')

const { payloadValidation } = require('../middlewares')
const { requireAdmin } = require('../middlewares/index')
const { updateUser, changePassword } = require('../schemas').users

router.get('/', userController.getUsers)
router.patch('/', payloadValidation(updateUser), userController.updateUser)
router.patch(
  '/change_password',
  payloadValidation(changePassword),
  userController.changePassword
)
router.delete('/:userId', requireAdmin, userController.deleteUser)

module.exports = router
