const router = require('express').Router()
const { userController } = require('../controllers')

router.get('/', userController.getAllUsers)
router.post('/', userController.createUser)

module.exports = router
