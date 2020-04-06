const { Schema, model } = require('mongoose')

const daySchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
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
    courses: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'courses'
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

daySchema.post('find', async docs => {
  for (const doc of docs) {
    await doc.populate('courses').execPopulate()
  }
})

daySchema.post('findOne', async doc => {
  await doc.populate('courses').execPopulate()
})

module.exports = model('days', daySchema)
