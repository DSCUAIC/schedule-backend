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
    const idToSearchFor = { _id: req.user['user:id'] }
    const user = await req.db.User.findOne(idToSearchFor)

    Object.keys(req.body).forEach( (key) => {
      req.user[key] = req.body[key] 
        })

    await req.db.User.updateOne(user, req.body)

    return res.json({
        success: true
    })
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
