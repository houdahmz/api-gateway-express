var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'imene.hassine@khallasli.com',
      pass: '123456789'
    }
  });
01

  exports.send_email = function send_email (subject , text){
    console.log("eeeeee")
    var mailOptions = {
        from: 'imene.hassine@khallasli.com',
        to: 'imen.hssinee@gmail.com',
        subject:subject,
        text: text
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  }
