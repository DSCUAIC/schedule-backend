const { Schema, model } = require('mongoose')

const daySchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
    },
    yearId: {
      type: String,
      required: true
    },
    year: {
      type: Object,
      default: null
    },
    facultyId: {
      type: String,
      required: true
    },
    faculty: {
      type: Object,
      default: null
    },
    scheduleId: {
      type: String,
      required: true
    },
    schedule: {
      type: Object,
      default: null
    },
    courses: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
)

module.exports = model('days', daySchema)
