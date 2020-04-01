const HttpStatus = require('http-status-codes')
const { createTkn, constants } = require('../utils')
const sendEmail = require('../utils/sendMail')
const bcrypt = require('bcrypt')

exports.login = async (req, res) => {
  try {
    const user = await req.db.User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found!'
      })
    }

    req.body.password = bcrypt.hashSync(req.body.password, constants.saltRounds)
    if (bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password!'
      })
    }

    delete user._doc.password

    const token = createTkn(
      { ...user._doc, aud: req.config.TKN_AUD, iss: req.config.TKN_ISS },
      req.config.JWT_KEY
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable to get user -> ${req.url} -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
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

    delete user._doc.password

    const token = createTkn(
      { ...user._doc, aud: req.config.TKN_AUD, iss: req.config.TKN_ISS },
      req.config.JWT_KEY
    )

    sendEmail({
      config: req.config,
      to: req.body.email,
      template: 'welcome',
      vars: { firstName: req.body.firstname, lastName: req.body.lastname }
    })

    return res.json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable to create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}
