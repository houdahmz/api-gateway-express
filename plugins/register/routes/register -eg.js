const services = require('express-gateway/lib/services/')
var bodyParser = require('body-parser')
const superagent = require('superagent');
const axios = require('axios');


module.exports = function (gatewayExpressApp) {
  gatewayExpressApp.use(bodyParser.json())


  gatewayExpressApp.post('/register', async (req, res, next) => {
    try {
        console.log("*********************************",req.body)
        return res.status(200).json(req.body)
    } catch (err) {
      console.log('*************************************error', err);
      return res.status(422).json({ error: err.message })
    }


  });



};
 