const HttpStatus = require('http-status-codes')
const fs = require('fs')

exports.getRoomSchedule = async (req, res) => {
    try {

        const orar = JSON.parse(fs.readFileSync("./data/schedule.json"))
        if(req.query.r === undefined){
            return res.status(HttpStatus.OK).send(orar); // ya gettin all the rooms, man
        }
        const rooms = req.query.r.split(',')
        console.log(rooms)
        let result = {}
        for(let an in orar){
            for(let zi in orar[an]){
                for(let entry in orar[an][zi]){
                    for(let room in rooms){
                        if(orar[an][zi][entry]['Sala'] === rooms[room]){
                            if(!result.hasOwnProperty(an)){
                                result[an] = {};
                            }
                            if(!result.hasOwnProperty(zi) && !Array.isArray(result[an][zi])){
                                result[an][zi] = [];
                            }
                            result[an][zi].push(orar[an][zi][entry]);
                        }
                    }
                }
            }
        }

        return res.status(HttpStatus.OK).json(result)
    } catch (error) {
        return res.send(error)
    }
}
