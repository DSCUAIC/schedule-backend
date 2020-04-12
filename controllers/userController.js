const HttpStatus = require('http-status-codes')
const bcrypt = require('bcrypt')
const {
  mongo: { ObjectId }
} = require('mongoose')

const { saltRounds } = require('../utils').constants

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
  // check if the current user is an admin
  const isAdmin = req.user.admin

  if (!isAdmin) {
    // the user is not an admin
    // get the data of the current user
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

  // the user is an admin
  // get the data of all users based on query parameters
  try {
    const users = await req.db.User.find(req.query)

    return res.status(HttpStatus.OK).json({
      success: true,
      users
    })
  } catch (error) {
    req.log.error(
      `Unable to get users based on queries -> ${req.url} -> ${error}`
    )
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
    const { email } = req.user

    const user = await req.db.User.findOne({ email })

    if (!bcrypt.compareSync(oldPass, user.password)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password!'
      })
    }

    const password = bcrypt.hashSync(newPass, saltRounds)

    await req.db.User.updateOne({ email }, { password })

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

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    const result = await req.db.User.deleteOne({
      _id: ObjectId(userId)
    })

    if (result) {
      return res.json({
        success: true,
        message: 'User deleted successfully'
      })
    }

    return res.json({
      success: false,
      message: 'User not found'
    })
  } catch (error) {
    req.log.error(`Unable to delete user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}
