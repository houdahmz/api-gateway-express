require('dotenv/config');
require('./../server');

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET ;
const HTTP_PORT_API_MANAGEMENT = process.env.HTTP_PORT_API_MANAGEMENT || 3000;
const HTTP_PORT_ADMIN = process.env.HTTP_PORT_ADMIN || 9876;
const ALGORITHM = process.env.ALGORITHM;
const JWT_SUBJECT = process.env.JWT_SUBJECT;
const JWT_TIME = process.env.JWT_TIME;
const baseURL = process.env.baseURL;

const USERADMIN = process.env.USERADMIN;
const PASSWORD = process.env.PASSWORD;
const EMAIL = process.env.EMAIL;
const PHONE = process.env.PHONE;


module.exports = {
    KEY: "uisfkskjebcio",
    HTTP_PORT: HTTP_PORT,
    JWT_SECRET: JWT_SECRET,
    JWT_SUBJECT: JWT_SUBJECT,
    JWT_TIME: JWT_TIME,
    ALGORITHM: ALGORITHM,

    USERADMIN: USERADMIN,
    PASSWORD: PASSWORD,
    EMAIL: EMAIL,
    PHONE: PHONE,

    HTTP_PORT_API_MANAGEMENT: HTTP_PORT_API_MANAGEMENT,
    HTTP_PORT_ADMIN: HTTP_PORT_ADMIN,
    baseURL: baseURL

  };
