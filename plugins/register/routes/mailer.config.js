var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'imen.hassine96@gmail.com',
      pass: '6Septembre1996!google'
    }
  });


  exports.send_email = function send_email (subject , text){
    var mailOptions = {
        from: 'imen.hassine96@gmail.com',
        to: 'sghhamza10@gmail.com',
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
