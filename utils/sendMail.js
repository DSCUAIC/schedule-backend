const nodemailer = require("nodemailer")

module.exports = {
    sendMail : function(mail) {
        if (typeof mail === 'string' || mail instanceof String) {
            let transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "testdsc242@gmail.com",
                    pass: "testdsc0"
                }
            });

            console.log(mail);

            let mailOption = {
                from: 'Test Test <testdsc242@gmail.com>', // sender address
                to: 'to-do', // list of receivers
                subject: "Hello", // Subject line
                text: "Hello world?", // plain text body
                html: "to-do" // html body --> to-do: de pus template-ul din templates/template1.html
            };

            transporter.sendMail(mailOption, error => {
                if(error) {
                    return console.log(error);
                }
            });
        }
    }
}