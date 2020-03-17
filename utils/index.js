const jwt = require('jsonwebtoken')
const fs = require('fs').promises

const constants = require('./constants')
exports.constants = constants

const { idClaim } = constants

exports.createTkn = (payload = {}, secret) => {
  payload[idClaim] = payload._id || null
  delete payload._id
  delete payload.password

  if (payload.exp === null) {
    delete payload.exp
    return jwt.sign(payload, secret)
  }

  if (payload.exp !== undefined || Number.isInteger(payload.exp)) {
    return jwt.sign(payload, secret)
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

exports.decodeTkn = (token, secret) => jwt.verify(token, secret)

exports.getEvenToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  }

  if (req.params && req.params.token) {
    return req.params.token
  }

  return null
}

exports.getSchedule = async path => {
  const schedule = await fs.readFile(path)

  return JSON.parse(schedule)
}
