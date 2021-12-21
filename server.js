const path = require('path');
const gateway = require('express-gateway');

require('dotenv-safe').config({
  allowEmptyValues: true,
});

gateway()
  .load(path.join(__dirname, 'config'))
  .run();
