const router = require('express').Router()
const { shareController } = require('../controllers')

router.get('/', shareController.getFavorites)
router.patch('/', shareController.updateFavorites)

module.exports = router
