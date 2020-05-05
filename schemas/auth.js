const Joi = require('@hapi/joi')

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

const register = Joi.object({
  username: Joi.string().optional(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().min(6).required()
})

const validate = Joi.object({
  token: Joi.string().required()
})

const forgotPassword = Joi.object({
  email: Joi.string().required().email()
})

module.exports = { login, register, validate, forgotPassword }
