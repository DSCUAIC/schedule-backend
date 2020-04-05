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

exports.getUsers = async (req, res) => {

  //check if the current user is an admin
  let isAdmin = req.user.admin
  
  if(!isAdmin) {
    //the user is not an admin
    //get the data of the current user
    try {
      const user = await req.db.User.findById(req.user['user:id'])
      
      return res.status(HttpStatus.OK).json({
        success: true,
        user
      })
    } catch (error) {
      req.log.error(`Unable to get current user -> ${req.url} -> ${error}`)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false
      })
    }
  }

  //the user is an admin
  //get the data of all users based on query parameters
  try {
    const users = await req.db.User.find(req.query)

    return res.status(HttpStatus.OK).json({
      success: true,
      users
    })
  } catch (error) {
    req.log.error(`Unable to get users based on queries -> ${req.url} -> ${error}`)
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
