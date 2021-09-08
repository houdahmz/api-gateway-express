var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    auth: {
      user: 'payposkhallasli@gmail.com',
      pass: 'khallasli123456789'
    }
  });
01
// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.log('error',error);

    console.log('error with email connection');
  }
});
  exports.send_email = function send_email (subject , text,mail){
    var mailOptions = {
        from: 'payposkhallasli@gmail.com',
        to: mail,
        subject:subject,
        text: text
      };
    console.log("mailOptions",mailOptions)

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  }

// EMAIL_USERNAME=khalaslipaypos@gmail.com 
// EMAIL_PASSWORD=khalasli26260534