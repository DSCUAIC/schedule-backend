const fs = require('fs')

const populate = async db => {
  try {
    const s1 = JSON.parse(fs.readFileSync('./data/schedule.json').toString())

    const fac = await db.Faculty.create({
      name: 'Facultatea de Informatica Iasi',
      shortName: 'FII'
    })

    const schedule = await db.Schedule.create({
      semester: 1,
      facultyId: fac._id.toString()
    })

    fac.sem1ScheduleId = schedule._id.toString()
    await fac.save()

    const years = []

    for (const year of Object.keys(s1)) {
      const currentYear = await db.Year.create({
        semester: schedule.semester,
        year: parseInt(year),
        facultyId: fac._id.toString(),
        scheduleId: schedule._id.toString()
      })

      const days = []

      for (const day of Object.values(s1[year])) {
        const currentDay = await db.Day.create({
          semester: schedule.semester,
          yearId: currentYear._id.toString(),
          facultyId: fac._id.toString(),
          scheduleId: schedule._id.toString()
        })

        const courses = []

        for (const course of day) {
          const currentCourse = await db.Course.create({
            semester: schedule.semester,
            dayId: currentDay._id.toString(),
            yearId: currentYear._id.toString(),
            facultyId: fac._id.toString(),
            scheduleId: schedule._id.toString(),
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

        currentDay.courses = courses.map(course => course._id.toString())
        await currentDay.save()

        days.push(currentDay)
      }

      currentYear.days = days.map(day => day._id.toString())
      await currentYear.save()

      years.push(currentYear)
    }

    schedule.years = years.map(year => year._id.toString())
    await schedule.save()

    process.exit()
  } catch (error) {
    console.log(error)
    process.exit()
  }
}

module.exports = populate
