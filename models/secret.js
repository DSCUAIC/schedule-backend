const { Schema, model } = require('mongoose')

const secretSchema = new Schema(
  {
    DB_URI: {
      type: String,
      required: true
    },
    DG_HOST: {
      type: String,
      required: true
    },
    DG_TOKEN: {
      type: String,
      required: true
    },
    DG_NAME: {
      type: String,
      required: true
    },
    PORT: {
      type: Number,
      required: true
    },
    JWT_KEY: {
      type: String,
      required: true
    },
    NODE_ENV: {
      type: String,
      required: true
    },
    SENDGRID_API_KEY: {
      type: String,
      required: true
    },
    CODACY_PROJECT_TOKEN: {
      type: String,
      required: true
    }
  }
)

module.exports = model('secrets', secretSchema)
