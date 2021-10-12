const path = require('path');
const gateway = require('express-gateway');
const swagger=require('swagger-express-jsdoc/app')
require('dotenv-safe').config({
  allowEmptyValues: true,
});

// import './test';
gateway()
  .load(path.join(__dirname, 'config'))
  .run();
