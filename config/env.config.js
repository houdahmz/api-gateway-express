require('dotenv/config');
require('./../server');

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET ;
const HTTP_PORT_API_MANAGEMENT = process.env.HTTP_PORT_API_MANAGEMENT || 3000;
const HTTP_PORT_ADMIN = process.env.HTTP_PORT_ADMIN || 9876;

module.exports = {
    KEY: "uisfkskjebcio",
    HTTP_PORT: HTTP_PORT,
    JWT_SECRET: JWT_SECRET,
    HTTP_PORT_API_MANAGEMENT: HTTP_PORT_API_MANAGEMENT,
    HTTP_PORT_ADMIN: HTTP_PORT_ADMIN


  };
