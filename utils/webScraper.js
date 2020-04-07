const cheerio = require('cheerio')
const axios = require('axios')
const fs = require('fs')

const urls = [
    'https://profs.info.uaic.ro/~arusoaie.andrei/temp/b7a93fer34/2019-2020,_sem_2/web/participanti/orar_I1.html',
    'https://profs.info.uaic.ro/~arusoaie.andrei/temp/b7a93fer34/2019-2020,_sem_2/web/participanti/orar_I2.html',
    'https://profs.info.uaic.ro/~arusoaie.andrei/temp/b7a93fer34/2019-2020,_sem_2/web/participanti/orar_I1.html'
]

let schedule = {}
const fields = [
    "De la",
    "Pana la",
    "Grupa",
    "Disciplina",
    "Tip",
    "Profesor",
    "Sala",
    "Frecventa",
    "Pachet"
];

(async () => {
    try {
        for (let year = 0; year < 3; year++) {
            const html = await axios.get(urls[year]);
            const $ = cheerio.load(html.data)
            const table = $('tr')

            schedule[year + 1] = {}
            let day = 'Luni'
            schedule[year + 1][day] = {}
            for (let row = 1; row < table.length; row++)
            {
                if ($(table[row]).children().length == 1)
                {
                    day = $(table[row]).children().text().trim()
                    schedule[year + 1][day] = []
                }
                else
                    {
                        let course = {}
                        for (let index = 0; index < $(table[row]).children().length; index++)
                        {
                            const child = $(table[row]).children().get(index)
                            if ($(child).children().length)
                            {
                                tags = $(child).children('a')
                                course[fields[index]] = ''
                                for (let elem = 0; elem < tags.length; elem++)
                                {
                                    if (course[fields[index]] !== '')
                                        course[fields[index]] += ', '
                                    course[fields[index]] += $(tags[elem]).text().trim()
                                }
                            } 
                            else
                                course[fields[index]] = $(child).text().trim()
                        }
                        schedule[year + 1][day].push(course)
                    }
            }
        }
        
        fs.writeFile("./data/scheduleFII2.json", JSON.stringify(schedule, null, 2), 'utf8', (err) => {
            if(err)
                console.error(err)
            else
                console.log('Data scraped successfully')
        })
    } catch (error) {
        console.error(error)        
    }
})()
