const { Schema, model } = require('mongoose')

const scheduleSchema = new Schema(
  {
    semester: {
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
    years: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
)

module.exports = model('schedules', scheduleSchema)
