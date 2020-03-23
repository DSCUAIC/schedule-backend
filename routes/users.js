const router = require('express').Router()
const { userController } = require('../controllers')

router.get('/', userController.getAllUsers)
router.post('/', userController.createUser)
router.post('/change_password', userController.changePassword)

module.exports = router
