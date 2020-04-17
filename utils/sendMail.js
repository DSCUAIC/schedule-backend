const sgMail = require('@sendgrid/mail')
const constants = require('./constants')

const { templates } = constants

const sendEmail = function ({ config, to, template, vars }) {
  sgMail.setApiKey(config.SENDGRID_API_KEY)

  const msg = {
    to,
    from: { name: 'Support schedule app', email: 'support@dsc-uaic.com' },
    templateId: templates[template],
    dynamicTemplateData: vars
  }

  return sgMail.send(msg)
}

module.exports = sendEmail
