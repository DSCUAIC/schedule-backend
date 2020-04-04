const HttpStatus = require('http-status-codes')
const { decodeTkn, getEvenToken, constants } = require('../utils')

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

  //get the current user id from the token
  const token = getEvenToken(req)
  const decoded = decodeTkn(token, req.config.JWT_KEY)
  const id = decoded[constants.idClaim]

  //check if the current user is an admin
  let isAdmin = req.user.admin
  
  if(!isAdmin) {
    //get the data of the current user
    try {
      const userData = await req.db.User.findById(id)

      return res.status(HttpStatus.OK).json({
        success: true,
        userData
      })
    } catch (error) {
      req.log.error(`Unable to get current user -> ${req.url} -> ${error}`)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false
      })
    }
  }

  if(isAdmin) {
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
