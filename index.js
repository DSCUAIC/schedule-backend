const server = require('./server')

try {
  server().then(app =>
    app.listen(process.env.PORT, () =>
      console.log(`App is listening on port ${process.env.PORT}`)
    )
  )
} catch (error) {
  console.error(error)
  process.exit(1)
}
