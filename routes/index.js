const router = require('express').Router()
const HttpStatus = require('http-status-codes')

const users = require('./users')
const auth = require('./auth')

router.get('/', (req, res) => {
  return res.status(HttpStatus.OK).json({
    status: 'active'
  })
})

router.use('/users', users)
router.use('/auth', auth)

module.exports = router
