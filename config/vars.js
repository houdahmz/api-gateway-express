// import .env variables
require('dotenv-safe').config({
    allowEmptyValues: true,
  });
  
  module.exports = {
    emailConfig: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
      baseURL: process.env.BASE_URL,
    },
  };
  
