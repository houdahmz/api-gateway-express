const path = require('path');
const gateway = require('express-gateway');
const swagger=require('swagger-express-jsdoc/app')

const run =require('./run')


require('dotenv-safe').config({
  allowEmptyValues: true,
});

// run.initiate()

gateway()
  .load(path.join(__dirname, 'config'))
  .run();
