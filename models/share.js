const { Schema, model } = require('mongoose')

const shareSchema = new Schema(
  {
    owner: {
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
