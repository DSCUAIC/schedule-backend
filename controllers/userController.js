const HttpStatus = require('http-status-codes')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await req.db.User.find({})

    return res.status(HttpStatus.OK).json({
      success: true,
      users
    })
  } catch (error) {
    req.log.error(`Unable get users -> ${req.url} -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
  } catch (error) {
    req.log.error(`Unable create user -> ${error}`)
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
    req.log.error(`Unable to change pass -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}
