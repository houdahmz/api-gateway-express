const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const env = require("../../../config/env.config");
const log4j = require("../../../config/configLog4js.js");
const configLog4js = require('../../../config/configLog4js.js');
  exports.verifyToken = async(req, res, next) =>{

    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {

      try {
        let token = (req.headers.authorization).replace("Bearer ", "");
        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decode", decoded)
          let body = req.body

          body.userId = decoded.consumerId
          body.id_user = decoded.consumerId


          body.created_by = decoded.consumerId
          body.deleted_by = decoded.consumerId
          body.updated_by = decoded.consumerId

          body.createdBy = decoded.consumerId
          body.deletedBy = decoded.consumerId
          body.updatedBy = decoded.consumerId
          next()
        } catch (error) {
          console.log("error", error)
          return res.status(403).send(error);
        }

      }
      catch (error) {
        let errorObject = { message: 'Unauthorized Token.', reason: error.name }
        console.log(errorObject);
        return res.status(403).send(errorObject);
      }

    } else {
      // Forbidden
      return res.sendStatus(403)
    }


  }
  exports.verifyTokenUser = async(req, res, next) =>{
    let body = req.body

    ///////////
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {

      try {
        let token = (req.headers.authorization).replace("Bearer ", "");
        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decode", decoded.consumerId)

          body.userId = decoded.consumerId
          body.id_user = decoded.consumerId


          body.created_by = decoded.consumerId
          body.deleted_by = decoded.consumerId
          body.updated_by = decoded.consumerId

          body.createdBy = decoded.consumerId
          body.deletedBy = decoded.consumerId
          body.updatedBy = decoded.consumerId
        } catch (error) {
          console.log("error", error)
          return res.status(403).send(error);
        }
        let myCredOauth;
        try {
          myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          console.log("myCredOauth", myCredOauth)

        } catch (error) {
          console.log("error", error)

        }

        console.log("myCredOauth", myCredOauth.scopes)

        let endpointScopes = "user";

        if (myCredOauth.scopes) {
          if (myCredOauth.scopes[0] == endpointScopes) {
            /**************************** */

            var data;
            try {
              data = await getProfile(req.body.userId, res)

            } catch (error) {
              console.log("error", error) //// tkt
              if (!error.response) {
                log4j.loggererror.error(error.message)
                return res.status(500).send({ "error": error.message });
              }
              log4j.loggererror.error("Error in getting profile: " + error.response.data)

              return res.status(error.response.status).send(error.response.data);

            }
            /********************************************************************************************** */
            console.log("data.data", data.data)
            console.log("*********************************")
            console.log("iciiiiiiiiiiiiiiiiiiii", data.data)
            console.log("*********************************")
            console.log("**************/////////////////////*******************")
            console.log("iciiiiiiiiiiiiiiiiiiii", data.data.data)
            console.log("****************//////////////////*****************")
            var dataWallet;

            if (data.data) {
              if (data.data.data) {
                console.log("data.data.data", data.data.data) //CompanyId

                try {
                  dataWallet = await getWallet(data.data.data.CompanyId, res)

                } catch (error) {
                  console.log("error", error) //// tkt
                  if (!error.response) {
                    log4j.loggererror.error(error.message)
                    return res.status(500).send({ "error": error.message });
                  }
                  log4j.loggererror.error("Error in getting profile: " + error.response.data)

                  return res.status(error.response.status).send(error.response.data);

                }
                console.log("dataWallet.data", dataWallet.data.data)

                if (dataWallet.data.data.data) {
                  body.walletId = dataWallet.data.data.data.items[0].id

                }
                else {
                  console.log("**************************************************")
                  console.log("req.body", body)
                  console.log("**************************************************")

                  body.walletId = null

                }

              }
            }
            console.log("**************************************************")
            console.log("req.body", req.body)
            console.log("**************************************************")

            next();
          }
          else {
            let errorObject = { message: 'Unauthorized Token. cannot' }
            console.log(errorObject);
            return res.status(403).send(errorObject);
          }
        }
      }
      catch (error) {
        let errorObject = { message: 'Unauthorized Token.', reason: error.name }
        console.log(errorObject);
        return res.status(403).send(errorObject);
      }

    } else {
      // Forbidden
      return res.sendStatus(403)
    }


  }

  exports.verifyTokenAdmin = async(req, res, next) =>{
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {

      try {
        let token = (req.headers.authorization).replace("Bearer ", "");
        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decode.consumerId", decoded.consumerId)
          req.body = {
            userId: decoded.consumerId
          }
        } catch (error) {
          console.log("error", error)
          return res.status(403).send(error);
        }
        let myCredOauth;
        try {
          myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          console.log("myCredOauth", myCredOauth)

        } catch (error) {
          console.log("error", error)
          return res.send({ "error": error.message });

        }
        console.log("myCredOauth", myCredOauth.scopes)

        let endpointScopes = "admin";

        if (myCredOauth.scopes) {
          if (myCredOauth.scopes[0] == endpointScopes) {
            console.log("req.headers.authorization", req.headers.authorization)
            console.log("**************************************************")
            console.log("req.body", req.body)
            console.log("**************************************************")

            // console.log("res.headers.authorization",res.headers.authorization)
            // res.headers.authorization = req.headers.authorization
            next();
          }
          else {
            let errorObject = { message: 'Unauthorized Token. cannot' }
            console.log(errorObject);
            return res.status(403).send(errorObject);
          }
        }
      }
      catch (error) {
        let errorObject = { message: 'Error Unauthorized Token.', reason: error.name }
        console.log(errorObject);
        return res.status(403).send(errorObject);
      }

    } else {
      // Forbidden
      return res.sendStatus(403)
    }


  }

  exports.verifyTokenSuperAdmin = async(req, res, next) =>{
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {

      try {
        let token = (req.headers.authorization).replace("Bearer ", "");
        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decode", decoded.consumerId)
          let body = req.body

          body.userId = decoded.consumerId
          body.id_user = decoded.consumerId


          body.created_by = decoded.consumerId
          body.deleted_by = decoded.consumerId
          body.updated_by = decoded.consumerId

          body.createdBy = decoded.consumerId
          body.deletedBy = decoded.consumerId
          body.updatedBy = decoded.consumerId
        } catch (error) {
          console.log("error", error)
          return res.status(403).send(error);
        }
        let myCredOauth;
        try {
          myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
        } catch (error) {
          console.log("error", error)
          return res.send({ "error": error.message });

        }

        console.log("myCredOauth", myCredOauth.scopes)

        let endpointScopes = "super_admin";

        if (myCredOauth.scopes) {
          if (myCredOauth.scopes[0] == endpointScopes) {
            console.log("**************************************************")
            console.log("req.body", req.body)
            console.log("**************************************************")

            next();
          }
          else {
            let errorObject = { message: 'Unauthorized Token. cannot' }
            console.log(errorObject);
            return res.status(403).send(errorObject);
          }
        }
      }
      catch (error) {
        let errorObject = { message: 'Unauthorized Token.', reason: error.name }
        console.log(errorObject);
        return res.status(403).send(errorObject);
      }

    } else {
      // Forbidden
      return res.sendStatus(403)
    }


  }

  exports.verifyTokenSuperAdminOrAdmin = async(req, res, next) =>{

    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {

      try {
        let token = (req.headers.authorization).replace("Bearer ", "");
        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decode", decoded.consumerId)
          let body = req.body

          body.userId = decoded.consumerId
          body.id_user = decoded.consumerId


          body.created_by = decoded.consumerId
          body.deleted_by = decoded.consumerId
          body.updated_by = decoded.consumerId

          body.createdBy = decoded.consumerId
          body.deletedBy = decoded.consumerId
          body.updatedBy = decoded.consumerId

        } catch (error) {
          console.log("error", error)
          return res.status(403).send(error);
        }
        let myCredOauth;
        try {
          myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
        } catch (error) {
          console.log("error", error)
          return res.send({ "error": error.message });

        }

        console.log("myCredOauth", myCredOauth.scopes)

        if (myCredOauth.scopes) {

          if (myCredOauth.scopes[0] == "super_admin" || myCredOauth.scopes[0] == "admin") {
            console.log("**************************************************")
            console.log("req.body", req.body)
            console.log("**************************************************")

            next();
          }
          else {
            let errorObject = { message: 'Unauthorized Token. cannot' }
            console.log(errorObject);
            return res.status(403).send(errorObject);
          }
        }
      }
      catch (error) {
        let errorObject = { message: 'Unauthorized Token.', reason: error.name }
        console.log(errorObject);
        return res.status(403).send(errorObject);
      }

    } else {
      // Forbidden
      return res.sendStatus(403)
    }


  }