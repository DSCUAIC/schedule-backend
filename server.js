const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const HttpStatus = require('http-status-codes')
const dotenv = require('dotenv')
const helmet = require('helmet')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

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

  const env = process.env.NODE_ENV || 'dev'
  const clientEmail = config.GOOGLE_NAME
  const privateKey = config.GOOGLE_KEY
  const projectId = config.PROJECT_ID

  const googleSecretManagerClient = new SecretManagerServiceClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    }
  })

  config = googleSecretManagerClient.getSecretVersion({
    name: `projects/${projectId}/secrets/${env}/versions/latest`
  })

  const httpTransportOptions = {
    host: process.env.DG_HOST || config.DG_HOST,
    path: `/v1/input/${
      process.env.DG_TOKEN || config.DG_TOKEN
    }?ddsource=nodejs&service=${process.env.DG_NAME || config.DG_NAME}`,
    ssl: true
  }

  const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    defaultMeta: { env: process.env.NODE_ENV || 'dev' },
    transports: [new transports.Http(httpTransportOptions)]
  })

  if (process.env.NODE_ENV === 'dev') {
    logger.add(new transports.Console({ format: format.simple() }))
  }

  const app = express()

  await mongoose.connect(config.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

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
