const jwt = require('jsonwebtoken');
const services = require('express-gateway/lib/services/');
const env = require('../config/env.config');
const logger = require('../config/Logger');

const validateUserPlugin = {
  schema: {$id: './../config/models/schema.js'},
  version: '1.0.0',
  policies: ['plugin'],
  init: function(pluginContext) {
    pluginContext.registerPolicy({
      name: 'validate-user',
      policy: (params) =>
        async function(req, res, next) {
          console.log('in validate-user');
          console.log('validate-user headerrrr',req.headers);

          try {
            const token = (req.headers.authorization).replace('Bearer ', '');
            let decoded;
            try {
              decoded = await jwt.verify(token, `${env.JWT_SECRET}`, {algorithms: ['HS256']});
              // console.log("decode", decoded)
            } catch (error) {
              console.log('error', error);
              res.status(403).send(error);
            }

            const myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2');
            console.log('*********************************');
            console.log('myCredOauth ', myCredOauth.scopes);

            let endpointScopes;
            if (req.egContext.apiEndpoint && req.egContext.apiEndpoint.scopes) {
              endpointScopes = req.egContext.apiEndpoint.scopes;
            }
            console.log('endpointScopes', endpointScopes);
            console.log('************************************');
            console.log('req.egContext',req.egContext.apiEndpoint);
            // console.log("req.egContext",req.egContext.apiEndpoint.methods[0] == 'GET')
            // console.log("req.egContext check",req.egContext.apiEndpoint.methods.includes("GET"))

            try {
              if (myCredOauth.scopes) {
                let boolean = 0;
                for (let index = 0; index < endpointScopes.length; index++) {
                  const element = endpointScopes[index];
                  console.log('index', index);
                  console.log('element', element);

                  if (myCredOauth.scopes[0] == element) {
                    index = endpointScopes.length - 1;
                    boolean = 1;
                    next();
                  }
                }
                if (boolean == 0) {
                  const errorObject = {message: 'Unauthorized Token'};
                  console.warn(errorObject);
                  res.status(403).send(errorObject);
                }
              }
            } catch (error) {
              res.status(403).send(error);
            }
          } catch (error) {
            const errorObject = {message: 'Unauthorized Token', reason: error.name};
            console.warn(errorObject);
            res.status(403).send(errorObject);
          }
        },
    },
    );
  },
};


module.exports = validateUserPlugin;
