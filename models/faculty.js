const {
  Schema,
  model
} = require('mongoose')

const facultySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    shortName: {
      type: String,
      unique: true,
      required: true
    },
    sem1Schedule: {
      type: Schema.Types.ObjectId,
      ref: 'schedules',
      default: null
    },
    sem2Schedule: {
      type: Schema.Types.ObjectId,
      ref: 'schedules',
      default: null
    }
  },
  { timestamps: true }
)

facultySchema.post('find', async docs => {
  for (const doc of docs) {
    await doc.populate('sem1Schedule').populate('sem2Schedule').execPopulate()
  }
})

facultySchema.post('findOne', async doc => {
  await doc.populate('sem1Schedule').populate('sem2Schedule').execPopulate()
})

module.exports = model('faculties', facultySchema)
