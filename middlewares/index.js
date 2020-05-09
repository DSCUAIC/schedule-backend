const HttpStatus = require('http-status-codes')
const { decodeTkn, getEvenToken, constants } = require('../utils')
const { idClaim } = constants
const payloadValidation = require('./payloadValidation')
const upload = require('./uploadValidation')

exports.setLogger = logger => {
  return (req, res, next) => {
    req.log = logger
    next()
  }
}

exports.setConfig = config => {
  return (req, res, next) => {
    req.config = config
    req.tknConfig = {
      iss: config.TKN_ISS,
      aud: config.TKN_AUD
    }
    next()
  }
}

exports.setDatabase = db => {
  return (req, res, next) => {
    req.db = db
    next()
  }
}

exports.requireAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      message: 'You must be an admin to access'
    })
  }

  next()
}


exports.payloadValidation = payloadValidation
exports.upload = upload
