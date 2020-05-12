const { Schema, model } = require('mongoose')

const shareSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true
    },
    recivers: {
      type: Array,
      default: []
    }
  }
)
module.exports = model('share', shareSchema)
