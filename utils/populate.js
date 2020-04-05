const fs = require('fs')

const populate = async db => {
  try {
    const s1 = JSON.parse(fs.readFileSync('./data/schedule.json').toString())

    const fac = await db.Faculty.findOne({
      name: 'Facultatea de Informatica Iasi',
      shortName: 'FII'
    })

    const schedule = await db.Schedule.create({
      semester: 2,
      faculty: fac._id
    })

    fac.sem2Schedule = schedule._id
    await fac.save()

    const years = []

    for (const year of Object.keys(s1)) {
      const currentYear = await db.Year.create({
        semester: schedule.semester,
        year: parseInt(year),
        faculty: fac._id,
        schedule: schedule._id
      })

      const days = []

      for (const day of Object.values(s1[year])) {
        const currentDay = await db.Day.create({
          semester: schedule.semester,
          year: currentYear._id,
          faculty: fac._id,
          schedule: schedule._id
        })

        const courses = []

        for (const course of day) {
          const currentCourse = await db.Course.create({
            semester: schedule.semester,
            day: currentDay._id,
            year: currentYear._id,
            faculty: fac._id,
            schedule: schedule._id,
            from: course['De la'],
            to: course['Pana la'],
            group: course.Grupa,
            discipline: course.Disciplina,
            professor: course.Profesor,
            room: course.Sala,
            frequency: course.Frecventa,
            package: course.Pachet,
            type: course.Tip
          })

          courses.push(currentCourse)
        }

        currentDay.courses = courses.map(course => course._id)
        await currentDay.save()

        days.push(currentDay)
      }

      currentYear.days = days.map(day => day._id)
      await currentYear.save()

      years.push(currentYear)
    }

    schedule.years = years.map(year => year._id)
    await schedule.save()

    process.exit()
  } catch (error) {
    console.log(error)
    process.exit()
  }
}

module.exports = populate
