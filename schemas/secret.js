const Joi = require('@hapi/joi')

const secretAddUpdate = Joi.object({
  key: Joi.string()
    .required(),
  value: Joi.string()
    .required(),
  env: Joi.string()
    .required()
})

module.exports = { secretAddUpdate }
