const { Schema, model } = require('mongoose')

const secretSchema = new Schema(
  {
    key: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    env: {
      type: String,
      required: true
    }
  }
)

module.exports = model('secrets', secretSchema)
