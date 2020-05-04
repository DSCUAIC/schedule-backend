const router = require('express').Router()
const { shareController } = require('../controllers')

router.get('/', shareController.getFavorites)
router.patch('/favoriteCourses', shareController.updateFavorites)
router.patch('/shareRecivers', shareController.updateRecivers)
module.exports = router
