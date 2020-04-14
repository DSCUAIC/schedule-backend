const HttpStatus = require('http-status-codes')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await req.db.User.find({})

    return res.status(HttpStatus.OK).json({
      success: true,
      users
    })
  } catch (error) {
    req.log.error(`Unable to get users -> ${req.url} -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
  } catch (error) {
    req.log.error(`Unable to update user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body
    const userToSearchFor = { email: req.user.email }
    const user = await req.db.User.findOne(userToSearchFor)
    if (user.password !== oldPass) {
      throw new Error('Wrong password!')
    }
    await req.db.User.updateOne(userToSearchFor, { password: newPass })
    return res.json({
      success: true
    })
  } catch (error) {
    req.log.error(`Unable to change password -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}

exports.createUser = async (req, res) => {
  try {
    const existingUser = await req.db.User.findOne({ email: req.body.email })

    if (existingUser) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'User already exists!'
      })
    }

    const user = await req.db.User.create(req.body)

    delete user._doc.password

    return res.json({
      success: true,
      message: 'User created'
    })
  } catch (error) {
    req.log.error(`Unable to create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}
