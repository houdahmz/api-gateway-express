const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const services = require('express-gateway/lib/services/')

const validateUserPlugin = {
  schema: { $id: "./../config/models/schema.js" },
  version: '1.0.0',
  policies: ['plugin'],
  init: function (pluginContext) {
    pluginContext.registerPolicy({
      name: 'validate-user',
      policy: (params) =>
        async function (req, res, next) {
          const requestedId = req.params.companyId;
          console.log("requestedId", requestedId)
          try {
            let token = (req.headers.authorization).replace("Bearer ", "");

            //     let filePath = path.resolve(__dirname, ('../keys/public.pem'));
            //   console.log("filePath",filePath)

            //     const secret = fs.readFileSync(filePath, 'utf8');
            //   console.log("secret",secret)

            let decoded;
            try {
              decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw', { algorithms: ['HS256'] });
              console.log("decode", decoded)

            } catch (error) {
              console.log("error", error)
              res.status(403).send(error);
            }

            const myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')

            console.log("myCredOauth scopes", myCredOauth.scopes)

            let endpointScopes;
            if (req.egContext.apiEndpoint && req.egContext.apiEndpoint.scopes) {
              endpointScopes = req.egContext.apiEndpoint.scopes;
            }
            console.log('endpointScopes', endpointScopes)

            if (myCredOauth.scopes) {
              if (myCredOauth.scopes[0] == endpointScopes[0]) {
                next();
              }
              else {
                let errorObject = { message: 'Unauthorized Token. cannot' }
                console.log(errorObject);
                res.status(403).send(errorObject);
              }
            }
            //   else{
            //     if(decoded.profile.company_entity_id==requestedId){
            //       next();
            //     }
            //     else{
            //         let errorObject = {message: 'Unauthorized Token.',reason: "Invalid company_Id."}
            //         console.log(errorObject);
            //         res.status(403).send(errorObject);
            //     }
            //   }
            // next()
          }
          catch (error) {
            let errorObject = { message: 'Unauthorized Token.', reason: error.name }
            console.log(errorObject);
            res.status(403).send(errorObject);
          }
        }
    }
    )
  }
}


module.exports = validateUserPlugin;