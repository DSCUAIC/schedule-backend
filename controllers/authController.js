const HttpStatus = require('http-status-codes')
const { createTkn, constants, decodeTkn } = require('../utils')
const sendEmail = require('../utils/sendMail')
const bcrypt = require('bcrypt')

const {
  mongo: { ObjectId }
} = require('mongoose')

const { idClaim } = require('../utils').constants

const { resetClaim } = constants

exports.login = async (req, res) => {
  try {
    const user = await req.db.User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found!'
      })
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password!'
      })
    }

    if (user.verified === false) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'User not validated!'
      })
    }

    const token = createTkn({ _id: user._id }, req.config.JWT_KEY)

    return res.status(HttpStatus.OK).json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable to get user -> ${req.url} -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.register = async (req, res) => {
  try {
    const existingUser = await req.db.User.findOne({ email: req.body.email })

    if (existingUser) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'User already exists!'
      })
    }

    req.body.password = bcrypt.hashSync(req.body.password, constants.saltRounds)
    const user = await req.db.User.create(req.body)

    const token = createTkn({ _id: user._id }, req.config.JWT_KEY)
    const link = 'http://localhost:4200/auth/verification?token=' + token
    sendEmail({
      config: req.config,
      to: req.body.email,
      template: 'emailVerification',
      vars: { firstName: req.body.firstname, lastName: req.body.lastname, link }
    })

    return res.status(HttpStatus.OK).json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable to create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.validate = async (req, res) => {
  try {
    const { token } = req.body
    const claims = decodeTkn(token, req.config.JWT_KEY)

    const user = await req.db.User.findOne({ _id: ObjectId(claims[idClaim]) })
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found!'
      })
    }

    await req.db.User.updateOne(
      { _id: ObjectId(claims[idClaim]) },
      { verified: true }
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable to validate user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await req.db.User.findOne({ email })

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      })
    }

    const token = createTkn(
      {
        _id: user._id,
        [resetClaim]: true
      },
      req.config.JWT_KEY
    )

    const link = 'http://localhost:4200/auth/resetPassword?token=' + token

    sendEmail({
      config: req.config,
      to: email,
      template: 'forgotPassword',
      vars: { firstname: user.firstname, lastname: user.lastname, link }
    })

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Successfully sent password recovery email!'
    })
  } catch (error) {
    req.log.error(`Unable to reset password -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
