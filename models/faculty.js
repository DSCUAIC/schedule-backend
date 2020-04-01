const {
  Schema,
  model,
  mongo: { ObjectId }
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
    sem1ScheduleId: {
      type: String,
      default: null
    },
    sem1Schedule: {
      type: Object,
      default: null
    },
    sem2ScheduleId: {
      type: String,
      default: null
    },
    sem2Schedule: {
      type: Object,
      default: null
    }
  },
  { timestamps: true }
)

facultySchema.statics.findOneAll = async function (query) {
  const fac = await this.model('faculties').findOne(query)

  if (fac.sem1ScheduleId) {
    fac.sem1Schedule = await this.model('schedules').findOne({
      _id: ObjectId(fac.sem1ScheduleId)
    })
  }

  if (fac.sem2ScheduleId) {
    fac.sem2Schedule = await this.model('schedules').findOne({
      _id: ObjectId(fac.sem2ScheduleId)
    })
  }

  return fac
}

module.exports = model('faculties', facultySchema)
