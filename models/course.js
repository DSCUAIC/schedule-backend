const { Schema, model } = require('mongoose')

const courseSchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
    },
    day: {
      type: Schema.Types.ObjectId,
      ref: 'days',
      default: null
    },
    year: {
      type: Schema.Types.ObjectId,
      ref: 'years',
      default: null
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'faculties',
      default: null
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'schedules',
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
