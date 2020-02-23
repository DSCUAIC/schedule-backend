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

exports.createUser = async (req, res) => {
  try {
  } catch (error) {
    req.log.error(`Unable create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}
