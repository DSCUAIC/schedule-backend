const router = require('express').Router()
const { userController } = require('../controllers')

const { payloadValidation, requireAdmin, upload } = require('../middlewares')
const {
  updateUser,
  changePassword,
  register,
  resetPassword
} = require('../schemas').users

router.get('/', userController.getUsers)
router.patch('/', payloadValidation(updateUser), userController.updateUser)
router.patch(
  '/change_password',
  payloadValidation(changePassword),
  userController.changePassword
)
router.delete('/:userId', requireAdmin, userController.deleteUser)
router.post(
  '/',
  requireAdmin,
  payloadValidation(register),
  userController.createUser
)
router.post(
  '/reset_password',
  payloadValidation(resetPassword),
  userController.resetPassword
)
router.patch(
  '/change_profile_image',
  upload.single('profileImage'),
  userController.changeProfileImage
)
module.exports = router
