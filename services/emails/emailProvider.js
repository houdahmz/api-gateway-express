const nodemailer = require('nodemailer');
const { emailConfig } = require('../../config/vars');
const Email = require('email-templates');

// SMTP is the main transport in Nodemailer for delivering messages.
// SMTP is also the protocol used between almost all email hosts, so its truly universal.
// if you dont want to use SMTP you can create your own transport here
// such as an email service API or nodemailer-sendgrid-transport

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
  secure: false, // upgrades later with STARTTLS -- change this based on the PORT
});

// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.log('error with email connection');
  }
});

exports.sendMail = async (object,text,url,toEmail,username,firstname ,lastname,randomPassword) => {
  console.log("toEmail",toEmail)
  console.log("emailConfig.username",emailConfig.username)
  console.log("emailConfig.password",emailConfig.password)
  console.log("url",url)



  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: 'sendMail',
      message: {
        to: toEmail,

      },
      locals: {
        productName: 'Khallasli',
        // passwordResetUrl should be a URL to your app that displays a view where they
        // can enter a new password along with passing the confirmToken in the params
        object: object,
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: toEmail,



        text: text,
        password: randomPassword,

        url: url,
      },
    })
    .catch((error) => console.log('error sending email' , error));
};

exports.sendMailAdminConfirmation = async (object,url,toEmail,firstname ,lastname,username,randomPassword) => {
  console.log("toEmail",toEmail)
  console.log("emailConfig.username",emailConfig.username)
  console.log("emailConfig.password",emailConfig.password)
  console.log("firstname",firstname)
  console.log("lastname",lastname)
  console.log("username",username)
  console.log("randomPassword",randomPassword)




  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: 'adminConfirm',
      message: {
        to: toEmail,

      },
      locals: {
        productName: 'Khallasli',
        object: object,
        firstname: firstname,
        lastname: lastname,
        url: url,
        username: username,
        password: randomPassword,

      },
    })
    .catch((error) => console.log('error sending password reset email' , error));
};

exports.sendPasswordReset = async (object,url,toEmail,firstname ,lastname) => {
  console.log("toEmail",toEmail)
  console.log("url",url)

  // console.log("confirmToken",confirmToken)

  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });
  // console.log("email",`${emailConfig.baseURL}/#/reset-pwd/?token=${confirmToken}`)
  email
    .send({
      template: 'passwordReset',
      message: {
        to: toEmail,

      },
      locals: {
        productName: 'Khallasli',
        // passwordResetUrl should be a URL to your app that displays a view where they
        // can enter a new password along with passing the confirmToken in the params
        passwordResetUrl: url,
        firstname: firstname,
        lastname: lastname,

      },
    })
    .catch((err) => console.log('error sending password reset email '+err));
};

exports.sendPasswordChange = async (object,text,url,toEmail) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: 'passwordChange',
      message: {
        to: toEmail,
      },
      locals: {
        // productName: 'khallasli',
        object: object,
        text: text,
        url: url,      },
    })
    .catch(() => console.log('error sending change password email'));
};

exports.sendChangePassword = async (object,text,url,toEmail,username,randomPassword) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: 'Changepswd',
      message: {
        to: toEmail,
      },
      locals: {
        productName: 'khallasli',
        object: object,
        text: text,
        url: url,     
        username: username,      
        randomPassword: randomPassword,      
      },
    })
    .catch((error) => console.log('error sending change password email',error));
};