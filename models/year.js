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
    days: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'days'
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

yearSchema.post('find', async docs => {
  for (const doc of docs) {
    await doc.populate('days').execPopulate()
  }
})

yearSchema.post('findOne', async doc => {
  await doc.populate('days').execPopulate()
})

module.exports = model('years', yearSchema)
