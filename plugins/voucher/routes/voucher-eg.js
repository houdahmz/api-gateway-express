const services = require('express-gateway/lib/services/')
const axios = require('axios');
const CircularJSON = require('circular-json');
const bodyParser = require("body-parser");

module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.get('/api/facial', async (req, res, next) => { // code=20 for agent created by admin
    try {
      const createAgentProfile = async () => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.get('http://localhost:5001/api/facial')
        } catch (error) {
          console.error(error)
        }
      }

      const userProfile = await createAgentProfile();
      const json = CircularJSON.stringify(userProfile);
      // JSON.stringify(userProfile)
      return res.status(200).json(userProfile.data);

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });


  function verifyApiKey(req, res, next) {

    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      // const bearer = bearerHeader.split(' ');
      // const bearerToken = bearer[1];
      // req.token = bearerToken;
      req.Value = bearerHeader;
      req.Key = "Authorization";
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  }


};






