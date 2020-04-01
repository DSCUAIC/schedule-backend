const { Schema, model } = require('mongoose')

const courseSchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
    },
    dayId: {
      type: String,
      required: true
    },
    day: {
      type: Object,
      default: null
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
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    discipline: {
      type: String,
      required: true
    },
    professor: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    package: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = model('courses', courseSchema)
