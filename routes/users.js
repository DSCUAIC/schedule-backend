const router = require('express').Router()
const { userController } = require('../controllers')

const { payloadValidation, requireAdmin , upload } = require('../middlewares')
const { updateUser, changePassword, register } = require('../schemas').users

router.get('/', userController.getUsers)
router.patch('/', payloadValidation(updateUser), userController.updateUser)
router.patch(
  '/change_password',
  payloadValidation(changePassword),
  userController.changePassword
)
router.patch(
  '/change_profile_image',
  upload.single('profileImage'),
  userController.changeProfileImage
)
router.post('/', requireAdmin, payloadValidation(register), userController.createUser)
module.exports = router
