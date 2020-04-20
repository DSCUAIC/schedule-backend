const HttpStatus = require('http-status-codes')
const bcrypt = require('bcrypt')

const { saltRounds } = require('../utils').constants
const cloudinary = require('cloudinary')

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

exports.createUser = async (req, res) => {
  try {
    const existingUser = await req.db.User.findOne({ email: req.body.email })

    if (existingUser) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'User already exists!'
      })
    }

    req.db.User.create(req.body)

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
exports.changeProfileImage = async (req, res) => {
  try {
    const { path } = req.file
    const { email } = req.user

    const user = await req.db.User.findOne({ email })
    if (user.profileImage.id) { await cloudinary.v2.uploader.destroy(user.profileImage.id) }
    const result = await cloudinary.v2.uploader.upload(path)
    const profileImage = {
      id: result.public_id,
      path: result.secure_url
    }

    await req.db.User.updateOne({ email }, { profileImage })

    return res.json({
      success: true
    })
  } catch (error) {
    req.log.error(`Unable to change profile image-> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}
