const Joi = require('@hapi/joi')

const changePassword = Joi.object({
  oldPass: Joi.string().min(6).required(),
  newPass: Joi.string().min(6).required()
})

const updateUser = Joi.object({
  username: Joi.string().optional(),
  firstname: Joi.string().optional(),
  lastname: Joi.string().optional(),
  group: Joi.number().optional(),
  semiyear: Joi.string().optional(),
  year: Joi.number().optional(),
  faculty: Joi.string().optional()
})

const resetPassword = Joi.object({
  password: Joi.string().min(6).required()
})

module.exports = { changePassword, updateUser, resetPassword }
