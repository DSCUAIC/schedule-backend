const router = require('express').Router()
const { secretsController } = require('../controllers')

const { payloadValidation, requireAdmin } = require('../middlewares')
const secretSchemas = require('../schemas').secret

router.post('/', requireAdmin, payloadValidation(secretSchemas.secretAddUpdate), secretsController.addSecret)
router.put('/', requireAdmin, payloadValidation(secretSchemas.secretAddUpdate), secretsController.updateSecret)

module.exports = router
