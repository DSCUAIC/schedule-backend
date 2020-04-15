const HttpStatus = require('http-status-codes')
const { decodeTkn, getEvenToken, constants } = require('../utils')
const { idClaim } = constants
const payloadValidation = require('./payloadValidation')

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
  if (req.user.admin) {
    next()
  }

  return res.status(HttpStatus.FORBIDDEN).json({
    success: false,
    message: 'You must be an admin to access'
  })
}

exports.requireAuth = () => {
  const skipPaths = ['/auth/register', '/auth/login']

  return (req, res, next) => {
    if (skipPaths.includes(req.path)) {
      return next()
    }

    try {
      const token = getEvenToken(req)

      if (token) {
        const decoded = decodeTkn(token, req.config.JWT_KEY)

        if (!decoded[idClaim]) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'You must have an idClaim in your token'
          })
        }

        req.user = decoded
        return next()
      }

      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'You must have an authorization token'
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error
      })
    }
  }
}

exports.payloadValidation = payloadValidation
