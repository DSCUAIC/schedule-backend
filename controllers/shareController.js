const HttpStatus = require('http-status-codes')
const {
  mongo: { ObjectId }
} = require('mongoose')

const { idClaim } = require('../utils').constants

exports.getFavorites = async (req, res) => {
  try {
    var user = await req.db.User.findOne({ _id: ObjectId(req.user[idClaim]) })
    const share = await req.db.Share.findOne({ _id: ObjectId(req.query.shareId) })

    if (share.ownerId === user._id || share.recivers.includes(user._id)) {
      const user = await req.db.User.findOne({ _id: share.ownerId })
      return res.status(HttpStatus.OK).json({
        success: true,
        favorites: user.favoriteCourses
      })
    } else {
      return res.status(HttpStatus.UNATHORIZED).json({
        success: false,
        message: "you don't have rights to view this"
      })
    }
  } catch (e) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad hapened!'
    })
  }
}

exports.updateFavorites = async (req, res) => {
  try {
    var user = await req.db.User.findOne({ _id: ObjectId(req.user[idClaim]) })
    let newFavoriteCourses = []

    for (const course in req.body.coursesToAdd) {
      newFavoriteCourses.push(course)
    }
    for (const course in user.favoriteCourses) {
      newFavoriteCourses.push(course)
    }
    newFavoriteCourses = [new Set(newFavoriteCourses)]

    for (const course in req.body.coursesToRemove) {
      newFavoriteCourses.filter((item, index) => item !== course)
    }

    await req.db.User.updateOne(
      { _id: ObjectId(req.user[idClaim]) },
      { favorites: newFavoriteCourses }
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Favorite courses updated successfully'
    })
  } catch (e) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}

exports.updateRecivers = async (req, res) => {
  try {
    var user = await req.db.User.findOne({ _id: ObjectId(req.user[idClaim]) })
    const share = await req.db.Share.find({ ownerId: user._id })

    let newRecivers = []

    for (const reciverId in req.body.reciverToAdd) {
      newRecivers.push(reciverId)
    }
    for (const reciverId in req.share.recivers) {
      newRecivers.push(reciverId)
    }
    newRecivers = [new Set(newRecivers)]

    for (const reciverId in req.body.reciverToRemove) {
      newRecivers.filter((item, index) => item !== reciverId)
    }
    await req.Share.updateOne(
      { _id: share._id },
      { recivers: newRecivers }
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Share recivers updated successfully'
    })
  } catch (e) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something bad happened!'
    })
  }
}
