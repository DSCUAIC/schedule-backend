const { Schema, model } = require('mongoose')

const scheduleSchema = new Schema(
  {
    semester: {
      type: Number,
      required: true
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'faculties',
      required: true
    },
    years: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'years'
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

scheduleSchema.post('find', async docs => {
  for (const doc of docs) {
    await doc.populate('years').execPopulate()
  }
})

scheduleSchema.post('findOne', async doc => {
  await doc.populate('years').execPopulate()
})

module.exports = model('schedules', scheduleSchema)
