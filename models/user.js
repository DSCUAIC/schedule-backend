const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  isMailVerified: {
    type: Boolean
  },
  token: {
    type: String
  }
})

module.exports = model('users', userSchema)
