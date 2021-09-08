var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'imene.hassine@khallasli.com',
      pass: '123456789'
    }
  });
01
// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.log('error with email connection');
  }
});
  exports.send_email = function send_email (subject , text,mail){
    var mailOptions = {
        from: 'imene.hassine@khallasli.com',
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