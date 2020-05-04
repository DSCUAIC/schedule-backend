const HttpStatus = require('http-status-codes')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {
  mongo: { ObjectId }
} = require('mongoose')
const cloudinary = require('cloudinary')
const { saltRounds, idClaim, resetClaim } = require('../utils').constants

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
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.getUsers = async (req, res) => {
  const isAdmin = req.user.admin

  if (!isAdmin) {
    try {
      const user = await req.db.User.findOne({
        _id: ObjectId(req.user[idClaim])
      })

      return res.status(HttpStatus.OK).json({
        success: true,
        user
      })
    } catch (error) {
      req.log.error(`Unable to get current user -> ${req.url} -> ${error}`)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something bad happened!'
      })
    }
  }

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
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = await req.db.User.findOne({ _id: ObjectId(req.user[idClaim]) })

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found!'
      })
    }

    await req.db.User.updateOne({ _id: ObjectId(req.user[idClaim]) }, req.body)

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'User updated successfully.'
    })
  } catch (error) {
    req.log.error(`Unable to update user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
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

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Successfully updated password!'
    })
  } catch (error) {
    req.log.error(`Unable to change password -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
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
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User deleted successfully'
      })
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    })
  } catch (error) {
    req.log.error(`Unable to delete user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
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

    await req.db.User.create(req.body)

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'User created'
    })
  } catch (error) {
    req.log.error(`Unable to create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    if (!req.user[resetClaim]) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'You must have a resetClaim in your request.'
      })
    }

    const { password } = req.body

    const newPassword = bcrypt.hashSync(password, saltRounds)

    await req.db.User.updateOne(
      { _id: ObjectId(req.user[idClaim]) },
      { password: newPassword }
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Successfully reseted password!'
    })
  } catch (error) {
    req.log.error(`Unable to reset password -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.changeProfileImage = async (req, res) => {
  try {
    const { path } = req.file
    const { email } = req.user

    const user = await req.db.User.findOne({ email })
    if (user.profileImage.id) {
      await cloudinary.v2.uploader.destroy(user.profileImage.id)
    }
    const result = await cloudinary.v2.uploader.upload(path)
    const profileImage = {
      id: result.public_id,
      path: result.secure_url
    }

    await req.db.User.updateOne({ email }, { profileImage })

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'User profile image changed successfully'
    })
  } catch (error) {
    req.log.error(`Unable to change profile image-> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}
