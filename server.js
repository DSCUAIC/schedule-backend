const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const HttpStatus = require('http-status-codes')
const dotenv = require('dotenv')
const helmet = require('helmet')
const Cryptr = require('cryptr')
const cloudinary = require("cloudinary")
const mongoose = require('mongoose')

const path = require('path')

const { createLogger, format, transports } = require('winston')

const { setLogger, setConfig, setDatabase } = require('./middlewares')
const db = require('./models')
const router = require('./routes')

const server = async () => {
  let config = dotenv.config({
    path: path.join(
      process.cwd(),
      'configs',
      `${process.env.NODE_ENV || 'dev'}.env`
    )
  }).parsed

  config = {
    PORT: process.env.PORT || config.PORT,
    DB_URI: process.env.DB_URI || config.DB_URI,
    SECRET_KEY: process.env.SECRET_KEY || config.SECRET_KEY
  }

  const cryptr = new Cryptr(config.SECRET_KEY)

  await mongoose.connect(process.env.DB_URI || config.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })

  const secrets = await db.Secret.find({ env: process.env.NODE_ENV || 'dev' })
  for (var secret of secrets) {
    config[secret.key] = cryptr.decrypt(secret.value)
  }

  const httpTransportOptions = {
    host: config.DG_HOST,
    path: `/v1/input/${config.DG_TOKEN}?ddsource=nodejs&service=${config.DG_NAME}`,
    ssl: true
  }

  const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    defaultMeta: { env: config.NODE_ENV },
    transports: [new transports.Http(httpTransportOptions)]
  })

  cloudinary.config({ 
    cloud_name: 'scheduleapp', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  
  if (process.env.NODE_ENV === 'dev' || config.NODE_ENV === 'dev') {
    logger.add(new transports.Console({ format: format.simple() }))
  }

  const app = express()

  // Middlewares
  app.use(cors())
  app.use(helmet())
  app.use(bodyParser.json())
  app.use(compression())
  app.use(setLogger(logger))
  app.use(setConfig(config))
  app.use(setDatabase(db))
  app.use('/', router)

  // 404
  app.use((req, res) => {
    return res
      .status(HttpStatus.NOT_FOUND)
      .send({ message: `Route ${req.url} Not found.` })
  })

  // 500 - Any server error
  app.use((error, req, res) => {
    req.log.error(error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error })
  })

  return app
}

module.exports = server
