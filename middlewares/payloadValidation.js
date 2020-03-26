const HttpStatus = require('http-status-codes')

const payloadValidation = schema => async (req, res, next) => {
  try {
    const { body: payload } = req

    await schema.validateAsync(payload)
    next()
  } catch (error) {
    console.error(error)
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = payloadValidation
