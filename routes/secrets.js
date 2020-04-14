const router = require('express').Router()
const { secretsController } = require('../controllers')

const { payloadValidation } = require('../middlewares')
const secretSchemas = require('../schemas').secret

router.post('/', payloadValidation(secretSchemas.secretAddUpdate), secretsController.addSecret)
router.delete('/', payloadValidation(secretSchemas.secretDelete), secretsController.deleteSecret)
router.put('/', payloadValidation(secretSchemas.secretAddUpdate), secretsController.updateSecret)

module.exports = router
