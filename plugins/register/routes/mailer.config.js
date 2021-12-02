const nodemailer = require('nodemailer');
const {emailConfig} = require('../../../config/vars');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.username,
      pass: emailConfig.password,
    },
  });
;
// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.log('error',error);

    console.log('error with email connection');
  }
});
  exports.send_email = function send_email(subject , text,mail) {
    const mailOptions = {
        from: emailConfig.username,
        to: mail,
        subject: subject,
        text: text,
      };
    console.log('mailOptions',mailOptions);

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ${ info.response}`);
        }
      });
  };
