require('dotenv/config');
require('./../server');

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const {JWT_SECRET} = process.env;
const HTTP_PORT_API_MANAGEMENT = process.env.HTTP_PORT_API_MANAGEMENT || 3000;
const HTTP_PORT_ADMIN = process.env.HTTP_PORT_ADMIN || 9876;
const {ALGORITHM} = process.env;
const {JWT_SUBJECT} = process.env;
const {JWT_TIME} = process.env;
const {baseURL} = process.env;
const {URL} = process.env;


const {USERADMIN} = process.env;
const {PASSWORD} = process.env;
const {EMAIL} = process.env;
const {PHONE} = process.env;


module.exports = {
    KEY: 'uisfkskjebcio',
    HTTP_PORT: HTTP_PORT,
    JWT_SECRET: JWT_SECRET,
    JWT_SUBJECT: JWT_SUBJECT,
    JWT_TIME: JWT_TIME,
    ALGORITHM: ALGORITHM,
    URL: URL,
    USERADMIN: USERADMIN,
    PASSWORD: PASSWORD,
    EMAIL: EMAIL,
    PHONE: PHONE,

    HTTP_PORT_API_MANAGEMENT: HTTP_PORT_API_MANAGEMENT,
    HTTP_PORT_ADMIN: HTTP_PORT_ADMIN,
    baseURL: baseURL,

  };
