const sgMail = require('@sendgrid/mail')

const templates = {
  welcome: 'd-1f1ae50ff4584d169e15b6924caf07c8'
}

const sendEmail = function ({ config, to, template, vars }) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || config.SENDGRID_API_KEY)

  const msg = {
    to,
    from: {name: 'Support schedule app', email: 'support@dsc-uaic.com'},
    templateId: templates[template],
    dynamicTemplateData: vars
  }

  return sgMail.send(msg)
}

module.exports = sendEmail
