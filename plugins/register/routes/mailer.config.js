var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'imen.hassine96@gmail.com',
      pass: '6Sept1996!google'
    }
  });
01

  exports.send_email = function send_email (subject , text){
    console.log("eeeeee")
    var mailOptions = {
        from: 'imen.hassine96@gmail.com',
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
