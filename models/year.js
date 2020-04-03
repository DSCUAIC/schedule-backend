const { Schema, model } = require('mongoose')

const yearSchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
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
    days: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
)

module.exports = model('years', yearSchema)
