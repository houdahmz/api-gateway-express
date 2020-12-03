const services = require('express-gateway/lib/services/')
var bodyParser = require('body-parser')
const superagent = require('superagent');
const axios = require('axios');


module.exports = function (gatewayExpressApp) {
  gatewayExpressApp.use(bodyParser.json())


  gatewayExpressApp.post('/api/register', async (req, res, next) => {
    try {
        console.log("*********************************",req.body)

  
        const {  firstname, lastname, email , phone , password, password_confirmation } = req.body
        if (password != password_confirmation) {
          throw new Error('password does not much')
        }

        myUser = await services.user.insert({
          isActive: false,
          firstname: firstname,
          lastname: lastname,
          username: email,
          email: email,
          phone: phone,
          redirectUri: 'https://www.khallasli.com',
        })
  
        crd_b = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: password,
          scopes: []
        })

        
        return res.status(200).json(req.body)

    } catch (err) {
      console.log('*************************************error', err);
      return res.status(422).json({ error: err.message })
    }


  });



};
 