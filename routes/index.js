const router = require('express').Router()
const HttpStatus = require('http-status-codes')

const users = require('./users')
const auth = require('./auth')

const { requireAuth } = require('../middlewares')

router.get('/', (req, res) => {
  return res.status(HttpStatus.OK).json({
    status: 'active'
  })
})

router.use('/auth', auth)

router.use(requireAuth())

router.use('/users', users)

module.exports = router
