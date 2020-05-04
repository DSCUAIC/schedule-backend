const HttpStatus = require('http-status-codes')
const {
  mongo: { ObjectId }
} = require('mongoose')

const { idClaim } = require('../utils').constants

exports.getFavorites = async (req, res) => {
  try {
    const share = await req.db.Share.findById(req.param.ShareId)
    if (share.ownerId === req.user.id || share.recivers.includes(req.user.id)) {
      const user = await req.user.findById(share.ownerId)
      return res.status(HttpStatus.OK).json({
        success: true,
        favorites: user.favoriteCourses
      })
    } else {
      return res.status(HttpStatus.Unathorized).json({
        success: false,
        message: "you don't have rights to view this"
      })
    }
  } catch (e) {
    return res.status(HttpStatus.InternalServerError).json({
      success: false,
      message: 'Something bad hapened!'
    })
  }
}

exports.updateFavorites = async (req, res) => {
  try {
    let newFavoriteCourses = []

    if (req.user) {
      for (const course in req.body.coursesToAdd) {
        newFavoriteCourses.push(course)
      }
      for (const course in req.user.favoriteCourses) {
        newFavoriteCourses.push(course)
      }
      newFavoriteCourses = [new Set(newFavoriteCourses)]

      for (const course in req.body.coursesToRemove) {
        newFavoriteCourses.filter((item, index) => item !== course)
      }

      await req.db.User.updateOne(
        { _id: ObjectId(req.user[idClaim]) },
        { password: newFavoriteCourses }
      )

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Favorite courses updated successfully'
      })
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something bad happened!'
      })
    }
  } catch (e) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
