const HttpStatus = require('http-status-codes')
const fs = require('fs')

exports.getRoomSchedule = async (req, res) => {
  try {
    const orar = JSON.parse(fs.readFileSync('./data/schedule.json'))
    if (req.query.r === undefined) {
      return res.status(HttpStatus.OK).send(orar) // ya gettin all the rooms, man
    }
    const rooms = req.query.r.split(',')
    console.log(rooms)
    const result = {}
    for (const an in orar) {
      for (const zi in orar[an]) {
        for (const entry in orar[an][zi]) {
          for (const room in rooms) {
            if (orar[an][zi][entry].Sala === rooms[room]) {
              if (!Object.prototype.hasOwnProperty.call(result, an)) {
                result[an] = {}
              }
              if (!Object.prototype.hasOwnProperty.call(result, zi) && !Array.isArray(result[an][zi])) {
                result[an][zi] = []
              }
              result[an][zi].push(orar[an][zi][entry])
            }
          }
        }
      }
    }
<<<<<<< HEAD
=======

    return res.status(HttpStatus.OK).json(result)
  } catch (error) {
    return res.send(error)
  }
>>>>>>> Fixed lint
}
