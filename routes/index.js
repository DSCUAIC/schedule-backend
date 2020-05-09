const router = require('express').Router()
const HttpStatus = require('http-status-codes')

const users = require('./users')
const auth = require('./auth')
const schedule = require('./schedule')
const secrets = require('./secrets')
const jwtAuth = require('jwt-auth-middleware')
const Cryptr = require('cryptr')
const db = require('../models')

const { requireAuth } = require('../middlewares')

router.get('/', (req, res) => {
  return res.status(HttpStatus.OK).json({
    status: 'active'
  })
})

router.use('/auth', auth)

db.Secret.findOne({env: process.env.NODE_ENV, key: "JWT_KEY"}, (err, secret) => {

  if(err) return handleError(err)
  key = new Cryptr(process.env.SECRET_KEY).decrypt(secret.value)
  router.use(jwtAuth.requireAuth(key))
})

router.use('/users', users)
router.use('/schedule', schedule)
router.use('/secrets', secrets)

module.exports = router