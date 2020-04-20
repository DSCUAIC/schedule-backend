const { Schema, model } = require('mongoose')

const userSchema = new Schema(
  {
    username: {
      type: String,
      default: null
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    group: {
      type: Number,
      default: null
    },
    semiyear: {
      type: String,
      maxlength: 1,
      default: null
    },
    year: {
      type: Number,
      maxlength: 1,
      default: null
    },
    faculty: {
      type: String,
      default: null
    },
    verified: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean,
      default: false
    },
    profileImage:{
      id:{
        type:String,
        default: null
      },
      path:{
        type:String,
        default: null
      }
    }
  },
  { timestamps: true }
)

userSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = `${this.firstname.toLowerCase()}.${this.lastname.toLowerCase()}`
  }

  next()
})

module.exports = model('users', userSchema)
