const HttpStatus = require('http-status-codes')
const { createTkn } = require('../utils')
const nodemailer = require("nodemailer")

exports.login = async (req, res) => {
  try {
    const user = await req.db.User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found!'
      })
    }

    if (req.body.password !== user.password) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password!'
      })
    }

    delete user._doc.password

    const token = createTkn(
      { ...user._doc, aud: req.config.TKN_AUD, iss: req.config.TKN_ISS },
      req.config.JWT_KEY
    )

    return res.status(HttpStatus.OK).json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable get user -> ${req.url} -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}

exports.register = async (req, res) => {
  try {
    const existingUser = await req.db.User.findOne({ email: req.body.email })

    if (existingUser) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'User already exists!'
      })
    }
    
    sendVerifMail(req.body.email).catch(console.error);

    const user = await req.db.User.create(req.body)

    delete user._doc.password

    const token = createTkn(
      { ...user._doc, aud: req.config.TKN_AUD, iss: req.config.TKN_ISS },
      req.config.JWT_KEY
    )

    return res.json({
      success: true,
      token
    })
  } catch (error) {
    req.log.error(`Unable create user -> ${error}`)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    })
  }
}

async function sendVerifMail(mail) {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: 'testdsc242@gmail.com',
        pass: 'testdsc0'
      }
    });

    let mailOption = {
      from: 'Test Test <testdsc242@gmail.com>', // sender address
      to: 'rusudaniel5799@gmail.com', // list of receivers
      subject: "Hello", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>" // html body --> to-do: de pus template-ul din templates/template1.html
    };

    transporter.sendMail(mailOption, error => {
      if(error) {
        return console.log(error);
      }
    });
}