const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')
const superagent = require('superagent');
const axios = require('axios');
const mail = require("./mailer.config");
const { user } = require('express-gateway/lib/services/');
const CircularJSON = require('circular-json');

const jwt = require('jsonwebtoken');
const env = require("../../../config/env.config");
const validation = require("./validation");
const config = require('express-gateway/lib/config/');
const tokenService = services.token;
const authService = services.auth;

const log4j = require("../../../config/configLog4js.js");

const os = require('os');
var ipF = require("ip");
const publicIp = require('public-ip');
useragent = require('express-useragent');
var device = require('express-device');
var MobileDetect = require('mobile-detect');
const { lookup } = require('geoip-lite');
const iplocate = require("node-iplocate");

const expiresIn = config.systemConfig.accessTokens.timeToExpiry / 1000;
const secretOrPrivateKey = config.systemConfig.accessTokens.secretOrPrivateKey
const fs = require('fs');
const PUB_KEY = fs.readFileSync("./config/public.pem", 'utf8');
const cors = require("cors");

// const bodyParser = require("body-parser");
const express = require('express');
const jsonParser = require('express').json();
const urlEncodedParser = require("express").urlencoded({ extended: true });
const { PassThrough } = require("stream");

const bodyParser = require("body-parser");
const app = express();
var corsOptions = {
  origin: "*"
};
  require("body-parser").urlencoded({ limit: "50mb", extended: true }),
  require("body-parser").json({ limit: "50mb", extended: true }),
  require("express").json({ limit: "50mb", extended: true }), //-- use express.json
  require("express").urlencoded({ limit: "50mb", extended: true }), //-- use express.urlencoded

  module.exports = function (gatewayExpressApp) {
    // gatewayExpressApp.use(bodyParser.json())
    gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
    gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    gatewayExpressApp.use(cors(corsOptions));
    gatewayExpressApp.use(device.capture());


    gatewayExpressApp.post('/register', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        const { firstname, username, lastname, email, phone, password, password_confirmation } = req.body

        // Validate against a password string
        if (validation.validatePassword(password) == false) {
          log4j.loggererror.error("Unkown error.")
          return res.status(400).json({error: "password is not valide"});
        }
        if (password != password_confirmation) {
          log4j.loggererror.error("Unkown error.")
          return res.status(400).json({error: "password does not much"});

        }
        // console.log("2222222222222222")

        // let teeeest = await services.user.findAll()
        // console.log("333333333333")

        // let test = await services.user.findByUsernameOrId(username)

        // let test = await services.user.getEmail(email)
        // console.log("testttttttttttttttttttt1111111")

        // console.log("testttttttttttttttttttt",test)
        const myUserJwt = await jwt.sign({ username: username, password: password }, `${env.JWT_SECRET}`, {
          issuer: 'express-gateway',
          audience: 'something',
          expiresIn: 18000,
          subject: '3pXQjeklS3cFf8OCJw9B22',
          algorithm: 'HS256'
        });

        console.log("myUserJwt", `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`)

        myUser = await services.user.insert({
          isActive: false,
          confirmMail: false,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          redirectUri: 'https://www.khallasli.com',
          confirm_token: myUserJwt
        })

        const getType = async (code) => {
          try {
        log4j.loggerinfo.info("Call getType: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
            log4j.loggererror.error("Error in getType: "+error.response.data)

            return res.status(error.response.status).send(error.response.data);
          }
        }
        console.log("myUser", myUser)

        const dataType = await getType("10");
        console.log("dataType", dataType)
        if (!dataType.data.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({"Error": "Problem in server"});
      
        }


        const creteProfile = async (myUser) => {
          try {
        log4j.loggerinfo.info("Call postProfile: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`, {
              id_user: myUser.id,
              first_name: myUser.firstname,
              last_name: myUser.lastname,
              phone: myUser.phone,
              typeId: dataType.data.data.id,
              created_by: myUser.id

            })
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
            log4j.loggererror.error("Error in createProfile :"+error.response.data)
          
          const deleted =  services.user.remove(myUser.id);

            return res.status(error.response.status).send(error.response.data);
          }
        }


        crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: password,
          scopes: []
        })
        console.log("crd_basiiiiiiiiiiic", crd_basic)

        crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['user'] })
        console.log("crd_oauth222222222222", crd_oauth2)


        const userProfile = await creteProfile(myUser);
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({"Error": "Problem in server"});
      
        }

        console.log("aaaa", userProfile)
        if (userProfile.data.status == "error") {
          // services.user.remove()
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

	  //console.log("aaaa iciii ",myUser.id)
          return res.status(400).json(userProfile.data);
        }

        myProfile = await services.application.insert({
          name: "complete_profile" + myUser.id,
          redirectUri: `${env.baseURL}:5000/api/profile`
        }, myUser.id)

        console.log("email", username)
        console.log("password", password)
        console.log("crd_oauth2.id", crd_oauth2.id)
        console.log("crd_oauth2.secret", crd_oauth2.secret)

        const confirm_uri = `${env.baseURL}:${env.HTTP_PORT}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
        console.log("confirm_uri", confirm_uri)
        //here je vais envoyer un mail

        mail.send_email("confirmation", "Veuillez cliquer sur lien pour activer votre compte \n " + confirm_uri);

        log4j.loggerinfo.info("Success, mail has been sent to : "+email);
        return res.status(201).json({ etat: "Success", message: "Check your email : " + email });
      } catch (err) {
        log4j.loggererror.error("Error :"+err.message)
        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.post('/registration-confirm', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        console.log("/registration-confirm")
        const { username, confirm_token } = req.query
        const user = await services.user.findByUsernameOrId(username)
        console.log("user", user)

        console.debug('confirmation', user, req.query, confirm_token, username)
        if (user == false) { // username does not exist
          console.debug('wrong confirmation token')
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)
          return res.status(200).json({ error: "wrong confirmation token" });
        }

        myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasic", myCredBasic)

        let decoded;
        try {
          decoded = await jwt.verify(confirm_token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decoded", decoded)

          if (!decoded) {
            console.debug('wrong confirmation token')
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

            return res.status(200).json({ error: "wrong confirmation token" });

          } else {
            if (user.username != decoded.username) {
              console.debug('???wrong confirmation token')
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

              return res.status(200).json({ error: "wrong confirmation token" });

            }
            const passBooleanTrue = await utils.compareSaltAndHashed(decoded.password, myCredBasic.password)

            if (!passBooleanTrue) {
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

              return res.status(200).json({ error: "wrong confirmation token" });

            }
          }
        } catch (error) {
          console.log("error", error)
          // res.status(403).send(error);
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

          return res.status(400).json({ error: error });
        }
        // user_res = await services.user.activate(user.id)
        console.log("user_res")

        user_res = await services.user.update(user.id, { confirmMail: 'true',confirm_token: "" }) //test this

        console.log("user_res", user_res)
        // user = await services.user.findByUsernameOrId(email)
        return res.status(200).json({ etat: "Success" });

      } catch (err) {
        log4j.loggererror.error("Error in adding profile: "+userProfile.data)

        return res.status(422).json({ error: err.message })
      }
    });


    gatewayExpressApp.patch('/complete-profile/:id', verifyTokenUser, async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        console.log("/api/complete-profile")
        if (!req.params.id) {
          console.log("*********************************", req.body)
          return res.status(200).json({ error: "Id can not be empty" })

        }
        const { commercial_register, city, zip_code, adresse, activity, updated_by, id_commercial } = req.body

        const updateprofile = async () => {
          try {
        log4j.loggerinfo.info("Call updateProfile. "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/`);

            return await axios.patch(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/` + req.params.id, {
              commercial_register: commercial_register,
              city: city,
              zip_code: zip_code,
              adresse: adresse,
              activity: activity,
              id_commercial: id_commercial,
              updated_by: updated_by

            })
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

            return res.status(error.response.status).send(error.response.data);
          }
        }
        let userProfile = await updateprofile();
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({"Error": "Problem in server"});
      
        }
        log4j.loggerinfo.info("Success");

        return res.status(200).json({ message: userProfile.data });

      } catch (err) {
        log4j.loggererror.error("Error in adding profile: "+userProfile.data)
        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.post('/agent-register', verifyTokenAdmin, async (req, res, next) => { // incomplete {add send mail with url /change_password} 
      try {
        const { firstname, username, lastname, email, phone, idOwner } = req.body
        console.log("/api/agent-register")

console.log("req.headers.authorization",req.headers.authorization)
        agentUser = await services.user.insert({
          isActive: true,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          redirectUri: 'https://www.khallasli.com',
        })

        const createAgentProfile = async (agentUser) => {

          try {
        log4j.loggerinfo.info("Call postProfile agent: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`
            , {    
 ///profile-by-company
                  idOwner: idOwner,
                  id_user: agentUser.id,
                  first_name: agentUser.firstname,
                  last_name: agentUser.lastname,
                  phone: agentUser.phone,
                  created_by: agentUser.id
    
                }      
)


// return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`
// , {    
// ///profile-by-company
//       idOwner: idOwner,
//       id_user: agentUser.id,
//       first_name: agentUser.firstname,
//       last_name: agentUser.lastname,
//       phone: agentUser.phone,
//       created_by: agentUser.id

//     }
//     ,{
//       headers: {
//       'Authorization': req.headers.authorization}
//     }

// )

// return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`
// , {    
//   headers: {
//   'Authorization': req.headers.authorization
// },
// body: JSON.stringify(       
// { ///profile-by-company
//       idOwner: idOwner,
//       id_user: agentUser.id,
//       first_name: agentUser.firstname,
//       last_name: agentUser.lastname,
//       phone: agentUser.phone,
//       created_by: agentUser.id

//     }
//     )
// }
// )
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
          log4j.loggererror.error("Error in adding profile: ")
          const deleted =  services.user.remove(myUser.id);

            return res.status(error.response.status).send(error.response.data);
          }
        }
        var randomPassword = Math.random().toString(36).slice(-8);
        console.log("randomPassword", randomPassword)
        console.log("agentUser", agentUser)

        crd_basic = await services.credential.insertCredential(agentUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: randomPassword,
          scopes: []
        })

        crd_oauth2 = await services.credential.insertCredential(agentUser.id, 'oauth2', { scopes: ['agent'] })
        console.log("crd_oauth2", crd_oauth2)
        console.log("email", email)
        console.log("password", randomPassword)
        console.log("crd_oauth2.id", crd_oauth2.id)
        console.log("crd_oauth2.secret", crd_oauth2.secret)

        const userProfile = await createAgentProfile(agentUser);
        console.log("userProfile.data", userProfile.data)
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({"Error": "Problem in server"});
      
        }
        if (userProfile.data.status == "error") {
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

          return res.status(200).json(userProfile.data);
        }

        mail.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " )");

        return res.status(201).json({ etat: "Success", message: "We have sent an email to " + agentUser.email + " to set a new password" });


      } catch (err) {
        log4j.loggererror.error("Error in adding profile: ")

        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.patch('/activate/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => {
      const { code } = req.body // code = 10 desactive , 11 active // id is a username
      if (!code) {
        log4j.loggererror.error("Unkown error.")

        return res.status(200).json({ error: "Code can not be empty (set 10 to desactivate or 11 to activate a user" });

      }
      myUser = await services.user.find(req.params.id)
      console.log("myUser", myUser)

      if (myUser == false) {
        log4j.loggererror.error("Unkown error.")

        return res.status(200).json({ message: "The user does not exist" });
      }

      if (code == 10) {
        myUser = await services.user.deactivate(myUser.id)
        if (myUser == true) {
          log4j.loggererror.error("Unkown error.")

          return res.status(200).json({ message: "The user has been desactivated" });
        }

      } else if (code == 11) {
        myUser = await services.user.activate(myUser.id)
        if (myUser == true) {
          log4j.loggererror.error("Unkown error.")

          return res.status(200).json({ message: "The user has been activated" });
        }
      }

    });


    gatewayExpressApp.post('/admin-register', verifyTokenSuperAdmin , async (req, res, next) => {
      try {
        console.log("/api/admin-register")

        const { firstname, username, lastname, email, phone } = req.body

        myUser = await services.user.insert({
          isActive: true,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          redirectUri: 'https://www.khallasli.com',
        })
        ////////////
        var randomPassword = Math.random().toString(36).slice(-8);
        console.log("randomPassword", randomPassword)


        //////////////
        const getType = async (code) => {
          try {
        log4j.loggerinfo.info("Call getType agent: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

            return res.status(error.response.status).send(error.response.data);
          }
        }
        const dataType = await getType("20") 
        if (!dataType.data.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({"Error": "Problem in server"});
      
        }
        /////////////
        console.log("aaaaaaaaaa dataType",dataType)

        const createAgentProfile = async (agentUser) => {

          try {
        log4j.loggerinfo.info("Call post Profile agent: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`, {
              id_user: agentUser.id,
              first_name: agentUser.firstname,
              last_name: agentUser.lastname,
              phone: agentUser.phone,
              typeId: dataType.data.data.id,
              created_by: agentUser.id

            })
          } catch (error) {
            if(!error.response){
              log4j.loggererror.error(error.message)
              return res.status(500).send({"error":error.message});
            }
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)
          const deleted =  services.user.remove(myUser.id);

            return res.status(error.response.status).send(error.response.data);

          }
        }
        //////////////
        // let userProfile;
  let  userProfile = await createAgentProfile(myUser) 
  if (!userProfile.data.data) {
    log4j.loggererror.error("Error Problem in server ")
    return res.status(500).json({"Error": "Problem in server"});

  }
          console.log("aaaaaaaaaa userProfile",userProfile.response)
        if (userProfile.data.status == "error") {
          log4j.loggererror.error("Error in adding profile: "+userProfile.data)

          return res.status(200).json(userProfile.data);
        }


        crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: randomPassword,
          scopes: []
        })
        console.log("crd_basic", crd_basic)

        crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['admin'] })
        console.log("crd_oauth2", crd_oauth2)
        console.log("email", email)
        console.log("password", randomPassword)
        console.log("crd_oauth2.id", crd_oauth2.id)
        console.log("crd_oauth2.secret", crd_oauth2.secret)

        mail.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " )");
        log4j.loggerinfo.info("Admin has been successfuly created, we have sent an email to " + email + " to set a new password");

        return res.status(201).json({ etat: "Success", message: "Admin has been successfuly created, we have sent an email to " + email + " to set a new password" });


      } catch (err) {
        log4j.loggererror.error("Error in adding profile: "+userProfile.data)

        return res.status(422).json({ error: err.message })
      }
    });

    async function verifyTokenUser(req, res, next) {

      const bearerHeader = req.headers['authorization'];

      if (bearerHeader) {

        try {
          let token = (req.headers.authorization).replace("Bearer ", "");
          let decoded;
          try {
            decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
            console.log("decode", decoded.consumerId)
            req.body = {
              userId: decoded.consumerId
            }
          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
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
              console.log("**************************************************")
              console.log("req.body",req.body)
              console.log("**************************************************")

              next();
            }
            else {
              let errorObject = { message: 'Unauthorized Token. cannot' }
              console.log(errorObject);
              res.status(403).send(errorObject);
            }
          }
        }
        catch (error) {
          let errorObject = { message: 'Unauthorized Token.', reason: error.name }
          console.log(errorObject);
          res.status(403).send(errorObject);
        }

      } else {
        // Forbidden
        res.sendStatus(403)
      }


    }

    async function verifyTokenAdmin(req, res, next) {
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
            res.status(403).send(error);
          }
          let myCredOauth;
          try {
            myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
            console.log("myCredOauth", myCredOauth)

          } catch (error) {
            console.log("error", error)
            res.send({"error":error.message});

          }
          console.log("myCredOauth", myCredOauth.scopes)

          let endpointScopes = "admin";

          if (myCredOauth.scopes) {
            if (myCredOauth.scopes[0] == endpointScopes) {
              console.log("req.headers.authorization",req.headers.authorization)
              console.log("**************************************************")
              console.log("req.body",req.body)
              console.log("**************************************************")

              // console.log("res.headers.authorization",res.headers.authorization)
              // res.headers.authorization = req.headers.authorization
              next();
            }
            else {
              let errorObject = { message: 'Unauthorized Token. cannot' }
              console.log(errorObject);
              res.status(403).send(errorObject);
            }
          }
        }
        catch (error) {
          let errorObject = { message: 'Error Unauthorized Token.', reason: error.name }
          console.log(errorObject);
          res.status(403).send(errorObject);
        }

      } else {
        // Forbidden
        res.sendStatus(403)
      }


    }

    async function verifyTokenSuperAdmin(req, res, next) {
      const bearerHeader = req.headers['authorization'];

      if (bearerHeader) {

        try {
          let token = (req.headers.authorization).replace("Bearer ", "");
          let decoded;
          try {
            decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
            console.log("decode", decoded.consumerId)
            req.body = {
              userId: decoded.consumerId
            }
          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
          }
          let myCredOauth;
          try {
            myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          } catch (error) {
            console.log("error", error)
            res.send({"error":error.message});

          }

          console.log("myCredOauth", myCredOauth.scopes)

          let endpointScopes = "super_admin";

          if (myCredOauth.scopes) {
            if (myCredOauth.scopes[0] == endpointScopes) {
              console.log("**************************************************")
              console.log("req.body",req.body)
              console.log("**************************************************")

              next();
            }
            else {
              let errorObject = { message: 'Unauthorized Token. cannot' }
              console.log(errorObject);
              res.status(403).send(errorObject);
            }
          }
        }
        catch (error) {
          let errorObject = { message: 'Unauthorized Token.', reason: error.name }
          console.log(errorObject);
          res.status(403).send(errorObject);
        }

      } else {
        // Forbidden
        res.sendStatus(403)
      }


    }

    async function verifyTokenSuperAdminOrAdmin(req, res, next) {

      const bearerHeader = req.headers['authorization'];

      if (bearerHeader) {

        try {
          let token = (req.headers.authorization).replace("Bearer ", "");
          let decoded;
          try {
            decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
            console.log("decode", decoded.consumerId)
            req.body = {
              userId: decoded.consumerId
            }
          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
          }
          let myCredOauth;
          try {
            myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          } catch (error) {
            console.log("error", error)
            res.send({"error":error.message});

          }

          console.log("myCredOauth", myCredOauth.scopes)

          if (myCredOauth.scopes) {

            if (myCredOauth.scopes[0] == "super_admin" || myCredOauth.scopes[0] == "admin") {
              console.log("**************************************************")
              console.log("req.body",req.body)
              console.log("**************************************************")

              next();
            }
            else {
              let errorObject = { message: 'Unauthorized Token. cannot' }
              console.log(errorObject);
              res.status(403).send(errorObject);
            }
          }
        }
        catch (error) {
          let errorObject = { message: 'Unauthorized Token.', reason: error.name }
          console.log(errorObject);
          res.status(403).send(errorObject);
        }

      } else {
        // Forbidden
        res.sendStatus(403)
      }


    }

    gatewayExpressApp.post('/api/login', async (req, res, next) => { // code=20 for agent created by admin
      console.log("*********************************", req.body)
      console.log("/api/login")

      const { username, password } = req.body
      console.log("eeee", password)
      console.log("zzzzz",corsOptions)

      myUser = await services.user.find(username)
      console.log("myUser", myUser)
      // myUserUpdte = await services.user.update(myUser.id,"firstname")
      if (myUser.confirmMail == 'false') {
        log4j.loggererror.error("Error please confirm your email ")

        return res.status(200).json({ error: "Confirm your email" });

      }
      if (myUser == false) {
        log4j.loggerinfo.info("Error username does not exist.");

        return res.status(200).json({ error: "username does not exist" });

      } else if (myUser.isActive == false) {
        log4j.loggerinfo.info("Error user is desactivated.");

        return res.status(200).json({ error: "user is desactivated" });

      }
      myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')

      console.log("myCredBasic ", myCredBasic)
      const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password)
      if (!passBooleanTrue) {
          log4j.loggererror.error("Error Wrong password")

        return res.status(200).json({ error: "Wrong password" });

      }

      myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2')
      let scope = myCredOauth.scopes;
      console.log("scope", scope)
      myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: scope })
      console.log("crd_oauth2 ", crd_oauth2)


      const getToken = async (username, password, client_id, client_secret) => {
        try {
        log4j.loggerinfo.info("Call getToken");

          return await axios.post(`${env.baseURL}:${env.HTTP_PORT}/oauth2/token`, {
            grant_type: "password",
            username: username,
            password: password,
            client_id: client_id,
            client_secret: client_secret
          })
        } catch (error) {
          if(!error.response){
            log4j.loggererror.error(error.message)
            return res.status(500).send({"error":error.message});
          }
          log4j.loggererror.error("Error in getToken: "+error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      // here should get the token and applique invoke before generating a new one
      let token;
      try {

        token = await getToken(username, password, crd_oauth2.id, crd_oauth2.secret)

      } catch (error) {
        log4j.loggererror.error("Error :"+error.message)

        console.log("Error", error.message)
        return res.status(500).send({"error":error.message});

      }

      ///////////

      const getProfile = async (id) => {
        try {
        log4j.loggerinfo.info("Call getProfile: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id)
        } catch (error) {
          if(!error.response){
            log4j.loggererror.error(error.message)
            return res.status(500).send({"error":error.message});
          }
          log4j.loggererror.error("Error in getting profile: "+error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////
      const getCategoryFromWalletWithCode = async (code) => {
        try {
        log4j.loggerinfo.info("Call getcategory: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category/`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category?name=`+code)
        } catch (error) {
          if(!error.response){
            log4j.loggererror.error(error.message)
            return res.status(500).send({"error":error.message});
          }
          log4j.loggererror.error("Error in getting getcategory: "+error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////
      /************************** */
      var md = new MobileDetect(req.headers['user-agent']);
      // var m = new MobileDetect(window.navigator.userAgent);
      console.log("md", md);
      // console.log("m", m);
      const md1 = new MobileDetect(req.get('User-Agent'));
      res.locals.isMobile = md1.mobile();
      console.log("md1", md1);

      console.log("md.os(), md.os()", md.os());
      if (md.os() === "iOS") {
        console.log("is ios");
      } else if (md.os() === "AndroidOS") {
        console.log("is android");

    }else if (md.os() === "AndroidOS") {
      console.log("is android");
  }

      var ip = (typeof req.headers['x-forwarded-for'] === 'string'
      && req.headers['x-forwarded-for'].split(',').shift()) || 
   req.connection.remoteAddress || 
   req.socket.remoteAddress || 
   req.connection.socket.remoteAddress
      console.log("ip",ip)
      console.log("req.connection.remoteAddress",req.connection.remoteAddress)
      // console.log("lookup",lookup(ip)); // location of the user

      console.log("os.platform()",os.platform())
      console.log("os.release()",os.release())
      console.log("os.type()",os.type()); // "Windows_NT"

      console.log("req.device.type.toUpperCase()",req.device.type.toUpperCase())
      // console.log("iplocate",iplocate(ip)); // location of the user
      // console.log("iplocate",iplocate(ip).country); // location of the user
      // console.log(iplocate(ip)); // location of the user
      console.log("ipaddre",ipF.address());
      let addr = ipF.address()
console.log("aaaaaaaaaaaaaaaaaaaa",addr)

const publicIpAdd = await publicIp.v4();
console.log("publicIpAdd",publicIpAdd)
      //////////////////////
      // let results;
      // try {
      //    results = await iplocate(publicIpAdd) 
      //   console.log("results",results)
  
      // } catch (error) {
      //   console.log("error",error)
        
      // }

      // iplocate(ip).then(function(results) {
      //    console.log("IP Address: " + results.ip);
      //    console.log("Country: " + results.country + " (" + results.country_code + ")");
      //    console.log("Continent: " + results.continent);
      //    console.log("Organisation: " + results.org + " (" + results.asn + ")");
        
      //    console.log(JSON.stringify(results, null, 2));
      //  });

      var source = req.headers['user-agent']
      var ua = useragent.parse(source);
      console.log("ua",ua)
      var isMobile = ua.isMobile
      console.log("isMobile",isMobile)

      let userUpdated = await services.user.update(myUser.id, {
        ip: publicIpAdd ,
        os: os.platform(),
        source: ua.source,
        // // geoip: lookup(ip),
        // country:results.country,
        // city:results.city,
        // latitude:results.latitude,
        // longitude:results.longitude,

        last_login: new Date().toString()
      })
      console.log("userUpdated",userUpdated)
      ///////////////////////
      
      var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log("addresses",addresses);
////////////////////////////
      const user = await services.user.findByUsernameOrId(myUser.id)
      console.log("user", user)

      /**************************** */

      var data;
      try {
        data = await getProfile(myUser.id)

      } catch (error) {
        console.log("error", error) //// tkt
        if(!error.response){
          log4j.loggererror.error(error.message)
          return res.status(500).send({"error":error.message});
        }
        log4j.loggererror.error("Error in getting profile: "+error.response.data)

        return res.status(error.response.status).send(error.response.data);

      }
/********************************************************************************************** */
console.log("data.data",data.data)
console.log("*********************************")
console.log("iciiiiiiiiiiiiiiiiiiii",data.data)
console.log("*********************************")
console.log("**************/////////////////////*******************")
console.log("iciiiiiiiiiiiiiiiiiiii",data.data.data)
console.log("****************//////////////////*****************")

if(data.data){
  if(data.data.data){
console.log("data.data.data",data.data.data)

    if (data.data.data.Company.Category){
console.log("data.data.data.Company",data.data.data.Company)

  console.log("data.data.data.Category",data.data.data.Company.Category)
  var code = data.data.data.Company.Category.code
      var dataCategory;
      try {
        dataCategory = await getCategoryFromWalletWithCode(code)
    
      } catch (error) {
        console.log("error", error) //// tkt
        if(!error.response){
          log4j.loggererror.error(error.message)
          return res.status(500).send({"error":error.message});
        }
        log4j.loggererror.error("Error in getting profile: "+error.response.data)
    
        return res.status(error.response.status).send(error.response.data);
    
      }
    }
  
  }
}
      /************************************************************************************** */

console.log("dataCategory.data",dataCategory)
console.log("dataCategory",dataCategory)

      /************************************************************************************** */

      console.log("Date.now()",Date.now())
      let name = "complete_profile" + Date.now()
      // userApp = await services.application.find(name)


      myApp = await services.application.insert({
        name: "user_app" + Date.now(),
        ip:user.ip,
        source:user.source,
        os:user.os,
        latitude:user.latitude,
        longitude:user.longitude,
        city:user.city,
        country:user.country
      }, myUser.id)

      userApp = await services.application.find(name)
      console.log("userapp",userApp)
      console.log("myApp",myApp)

      let userJson = {
        id:user.id,
        username:user.username,
        lastname:user.lastname,
        firstname:user.firstname,
        email:user.email,
        isActive:user.isActive,
        phone:user.phone,
        createdAt:user.createdAt,
        updatedAt:user.updatedAt,
        application:{
          id:myApp.id,
          ip:user.ip,
          source:user.source,
          os:user.os,
          last_login:user.last_login,
          latitude:user.latitude,
          longitude:user.longitude,
          city:user.city,
          country:user.country
        }
      }

      if (token) {
        if (token.status == 200) {
          if (data.status == 200) {
            log4j.loggerinfo.info("Succes in getting token.");
if(dataCategory.data.data.data){
  return res.status(token.status).json({ token: token.data, role: scope ,user: userJson ,profile: data.data.data, categoryWalletId: dataCategory.data.data});

}
return res.status(token.status).json({ token: token.data, role: scope ,user: userJson ,profile: data.data.data, categoryWalletId: null});

          }

        }
      }
      else {
        log4j.loggererror.error("Error in getting profile")
        return res.status(500).send("error");

      }

      log4j.loggerinfo.info("Getting token");
console.log("token.status",token.status)
console.log("token",token)

console.log("scope",scope)
console.log("myUser",myUser)

      return res.status(token.status).json({token: token, role: scope ,user: myUser });

    });

    gatewayExpressApp.get('/api/logout', async (req, res, next) => { // still incomplete
      console.log('heere', req.headers.authorization)
      const test = await services.token.getTokenObject(req.headers.authorization)

      return res.status(200).json(test);

    });

    gatewayExpressApp.post('/api/refreshToken', async (req, res, next) => { // still incomplete
      const { client_id, refresh_token } = req.body

      myCredOauth = await services.credential.getCredential(client_id, 'oauth2')
      myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2')
      crd_oauth2 = await services.credential.insertCredential(client_id, 'oauth2')
      console.log("crd_oauth2 ", crd_oauth2)

      const getRefreshToken = async (client_id, client_secret, refresh_token) => {
        try {
          return await axios.post(`${env.baseURL}:${env.HTTP_PORT}/oauth2/token`, {
            grant_type: "refresh_token",
            refresh_token: refresh_token,
            client_id: client_id,
            client_secret: client_secret
          })
        } catch (error) {
          console.error("error")
          return res.status(400).json("error", error);

        }
      }
      // const refresh_token = getRefreshToken(client_id,crd_oauth2.secret,refresh_token)

      // const refresh_token = req.body.refresh_token
      const test = await services.token.getTokenObject(refresh_token)
      console.log("test", test)
      return res.status(200).json(test);


    });

    gatewayExpressApp.post('/forgot-password', async (req, res, next) => { //get email from user change to email
      const username = req.body.username
      const user = await services.user.findByUsernameOrId(username)
      console.log("user", user)
      console.debug('confirmation', user, username)
      if (user == false) { // username does not exist
        console.debug('Username does not exist')
        log4j.loggererror.error("Error Username does not exist: ")

        return res.status(200).json({ error: "Username does not exist" });
      }
      const myUserJwt = await jwt.sign({ username: username }, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: 18000,
        subject: '3pXQjeklS3cFf8OCJw9B22',
        algorithm: 'HS256'
      });
      console.log("aaa", myUserJwt)

      const confirm_uri = `${env.baseURL}:${env.HTTP_PORT}/reset-password?username=` + username + "&" + "token=" + myUserJwt;
      console.log("confirm_uri", confirm_uri)
      //here je vais envoyer un mail

      mail.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe " + confirm_uri + " \n Link valable pour 5 heures");
      log4j.loggerinfo.info("Success check your email : " + user.email);

      return res.status(201).json({ etat: "Success", message: "Check your email : " + user.email });



    });

    gatewayExpressApp.post('/reset-password', async (req, res, done) => {

      try {
        console.log("/reset")
        const { username, token } = req.query
        const { password, password_confirmation } = req.body
        console.log("dddd", password)
        const user = await services.user.findByUsernameOrId(username)
        console.log("user", user)

        console.debug('confirmation', user, req.query, token, username)
        if (user == false) { // username does not exist
          console.debug('wrong confirmation token')
          log4j.loggererror.error("Error wrong confirmation token")

          return res.status(200).json({ error: "wrong confirmation token" });
        }

        let myCredBasicA = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasicssssssss", myCredBasicA)

        let decoded;
        try {
          decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("decoded", decoded)

          if (!decoded) {
            console.debug('wrong confirmation token')
          log4j.loggererror.error("Error wrong confirmation token")

            return res.status(200).json({ error: "wrong confirmation token" });

          } else {
            if (user.username != decoded.username) {
              console.debug('wrong confirmation token')
          log4j.loggererror.error("Error wrong confirmation token")

              return res.status(200).json({ error: "wrong confirmation token" });

            }

            if (password != password_confirmation) {
          log4j.loggererror.error("Error password does not much ")

              return res.status(200).json({ error: "password does not much" });
            }

            console.log("ddd")
          }
        } catch (error) {
          console.log("error", error.message)
          // res.status(403).send(error);
          log4j.loggererror.error("Error "+error.message)

          return res.status(400).json({ error: error.message });

        }

        let myCredBasic = await services.credential.removeCredential(user.id, 'basic-auth')
        myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')

        const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: password,
          scopes: []
        })

        myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasic", myCredBasic)

        const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password)
        if (!passBooleanTrue) {
          log4j.loggererror.error("Error wrong confirmation token ")

          return res.status(200).json({ error: "wrong confirmation token" });
        }
        log4j.loggerinfo.info("Success.");

        return res.status(200).json({ etat: "Success" });
      } catch (err) {
        log4j.loggererror.error("Error: "+err.message)

        return res.status(422).json({ error: err.message })
      }

    });

    gatewayExpressApp.post('/api/test_password', async (req, res, done) => { // still 

      const validateConsumer = await authService.validateConsumer(req.body.consumerId);
      const user = await authService.authenticateCredential(req.body.username, req.body.password, 'basic-auth');
      const createJWT = await tokenService.createJWT({ consumerId: req.body.consumerId, scopes: req.body.scopes })
      const saveJWT = await tokenService.save({ consumerId: req.body.consumerId, scopes: req.body.scopes }, { refreshTokenOnly: true })
      const tokenCriteria = {
        consumerId: req.body.consumerId,
        authenticatedUser: user.id
      };
      const token = await tokenService.findOrSave(tokenCriteria, { includeRefreshToken: true })

      console.log("validateConsumer", validateConsumer)
      console.log("user", user)
      console.log("createJWT", createJWT)
      console.log("saveJWT", saveJWT)
      console.log("findOrSaveJWT", token)
      console.log("findOrSaveJWT", token)
      return res.status(200).json("token");

    });

    gatewayExpressApp.get('/api/logout', async (req, res, next) => { // still incomplete
      console.log('heere', req.headers.authorization)
      const test = await services.token.getTokenObject(req.headers.authorization)

      return res.status(200).json(test);

    });

    gatewayExpressApp.get('/stats', async (req, res, next) => { // still incomplete


        try {

      log4j.loggerinfo.info("Call paymee: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
     const amountPaymee =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`,{
      yearB: req.query.yearB,
      dayB: req.query.dayB
    })
    // console.log("amountPaymee",amountPaymee)
    console.log("amountPaymee.data",amountPaymee.data)
          if(!amountPaymee.data){
            res.status("500").json("Error: error server");
          }

          log4j.loggerinfo.info("Call topnet: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
          const amountTopnet =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`,{
            yearB: req.query.yearB,
            dayB: req.query.dayB
          })
    console.log("amountTopnet.data",amountTopnet.data)

               if(!amountTopnet.data){
                 res.status("500").json("Error: error server");
               }

               log4j.loggerinfo.info("Call voucher: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
               const amountVoucher =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,{
                 yearB: req.query.yearB,
                 dayB: req.query.dayB
               })
    console.log("amountVoucher.data",amountVoucher.data)

                    if(!amountVoucher.data){
                      res.status("500").json("Error: error server");
                    }
     

               log4j.loggerinfo.info("Call poste: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
               const amountPosteRecharge =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`,{
                yearB: req.query.yearB,
                dayB: req.query.dayB
              })
    console.log("amountPosteRecharge.data",amountPosteRecharge.data)

                    if(!amountPosteRecharge.data){
                      res.status("500").json("Error: error server");
                    }
                    log4j.loggerinfo.info("Call poste: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
                    const amountPostePayemnt =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`,{
                      yearB: req.query.yearB,
                      dayB: req.query.dayB
                    })
    console.log("amountPostePayemnt",amountPostePayemnt)

                         if(!amountPostePayemnt.data){
                           res.status("500").json("Error: error server");
                         }
                         console.log("amountPaymee",amountPaymee.data)
                         console.log("amountPosteRecharge",amountPosteRecharge.data)
                         console.log("amountPostePayemnt",amountPostePayemnt.data)
                         console.log("amountTopnet",amountTopnet.data)
                         console.log("amountVoucher",amountVoucher.data)


                         let ca = amountPaymee.data.data.amount.Success+amountPosteRecharge.data.data.amount.Success+amountPostePayemnt.data.data.amount.Success+amountTopnet.data.data.amount.Success
                         console.log("ca",ca)
                         let nbT = amountPaymee.data.data.transaction.All+amountPosteRecharge.data.data.transaction.All+amountPostePayemnt.data.data.transaction.All+amountTopnet.data.data.transaction.All

                         log4j.loggerinfo.info("Call stats by month endpoint api-management/admin/statsAllMonth: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
                         const statsDataAllMonth =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`)
                        // console.log("statsDataAllMonth",statsDataAllMonth)
                        console.log("statsDataAllMonth.data",statsDataAllMonth.data)
                              if(!statsDataAllMonth.data){
                                res.status("500").json("Error: error server");
                              }

                              log4j.loggerinfo.info("Call statsCommission endpoint api-management/wallet/stats-commission: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
                              const statsDataCommission =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`)
                             // console.log("statsDataCommission",statsDataCommission)
                             console.log("statsDataCommission.data",statsDataCommission.data)
                                   if(!statsDataCommission.data){
                                     res.status("500").json("Error: error server");
                                   }

      return res.status(200).json({
        "Services":{
          "paymee": amountPaymee.data.data,
          "voucher": amountVoucher.data,
          "poste_recharge": amountPosteRecharge.data.data,
          "poste_payement": amountPostePayemnt.data.data,
          "topnet": amountTopnet.data.data
        },
        "CA":ca,
        "Nombre_transaction":nbT,
        // "Stats_Commission":statsDataCommission.data.data,
        "Stats_by_month": statsDataAllMonth.data.data

      });






    } catch (error) {
      if(!error.response){
        log4j.loggererror.error(error.message)
        return res.status(500).send({"error":error.message});
      }
      log4j.loggererror.error("Error: ")
      return res.status(error.response.status).send(error.response.data);
    }

    });


    gatewayExpressApp.get('/stats/byUser', verifyTokenUser ,async (req, res, next) => { // still incomplete


      try {
console.log("------------------------")
console.log("----------req.body.userId-------------- ",req.body.userId)
req.query.userId = req.body.userId
console.log("----------req.query.userId-------------- ",req.query.userId)

console.log("------------------------")
const paramPaymee = {
  id_pdv: req.query.userId,  
  yearB: req.query.yearB,
  dayB: req.query.dayB
}
console.log("paramPaymee",paramPaymee)
    log4j.loggerinfo.info("Call paymee: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
   const amountPaymee =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`,{
    params:paramPaymee
          })
  // console.log("amountPaymee",amountPaymee)
  console.log("*************************************")
  console.log("amountPaymee.data",amountPaymee.data)
  console.log("*************************************")

   
        if(!amountPaymee.data){
          res.status("500").json("Error: error server");
        }

        log4j.loggerinfo.info("Call topnet: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
        const amountTopnet =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`,{
          company_id: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB
        })
  console.log("amountTopnet.data",amountTopnet.data)

             if(!amountTopnet.data){
               res.status("500").json("Error: error server");
             }

             log4j.loggerinfo.info("Call voucher: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
             const amountVoucher =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,{
              id_user: req.query.userId, 
              yearB: req.query.yearB,
               dayB: req.query.dayB
             })
  console.log("amountVoucher.data",amountVoucher.data)

                  if(!amountVoucher.data){
                    res.status("500").json("Error: error server");
                  }
   

             log4j.loggerinfo.info("Call poste: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
             const amountPosteRecharge =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`,{
              company_id: req.query.userId,
              yearB: req.query.yearB,
              dayB: req.query.dayB
            })
  console.log("amountPosteRecharge.data",amountPosteRecharge.data)

                  if(!amountPosteRecharge.data){
                    res.status("500").json("Error: error server");
                  }
                  log4j.loggerinfo.info("Call poste: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
                  const amountPostePayemnt =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`,{
                    company_id: req.query.userId,  
                    yearB: req.query.yearB,
                    dayB: req.query.dayB
                  })
  console.log("amountPostePayemnt",amountPostePayemnt.data)

                       if(!amountPostePayemnt.data){
                         res.status("500").json("Error: error server");
                       }
                       console.log("amountPaymee",amountPaymee.data)
                       console.log("amountPosteRecharge",amountPosteRecharge.data)
                       console.log("amountPostePayemnt",amountPostePayemnt.data)
                       console.log("amountTopnet",amountTopnet.data)
                       console.log("amountVoucher",amountVoucher.data)
                       let ca = 0;
// if (condition) {
  
// }
console.log("amountPaymee.data",amountPaymee.data)
                       ca = amountPaymee.data.data.amount.Success+amountPosteRecharge.data.data.amount.Success+amountPostePayemnt.data.data.amount.Success+amountTopnet.data.data.amount.Success
                       console.log("ca",ca)
                       let nbT = amountPaymee.data.data.transaction.All+amountPosteRecharge.data.data.transaction.All+amountPostePayemnt.data.data.transaction.All+amountTopnet.data.data.transaction.All
                       console.log("azerty",
                       {
                        userId: req.userId,
                        query: req.query.userId,
                        body: req.body.userId
                                            }
                       )
                       log4j.loggerinfo.info("Call stats by month endpoint api-management/admin/statsAllMonth: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
                       const statsDataAllMonth =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`,
                       {
                        userId: req.body.userId
                                            }
                                            )
                      // console.log("statsDataAllMonth",statsDataAllMonth)
                      console.log("statsDataAllMonth.data",statsDataAllMonth.data)
                            if(!statsDataAllMonth.data){
                              res.status("500").json("Error: error server");
                            }

                          //   log4j.loggerinfo.info("Call statsCommission endpoint api-management/wallet/stats-commission: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
                          //   const statsDataCommission =  await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`)
                          //  // console.log("statsDataCommission",statsDataCommission)
                          //  console.log("statsDataCommission.data",statsDataCommission.data)
                          //        if(!statsDataCommission.data){
                          //          res.status("500").json("Error: error server");
                          //        }

    return res.status(200).json({
      "Services":{
        "paymee": amountPaymee.data.data,
        "voucher": amountVoucher.data,
        "poste_recharge": amountPosteRecharge.data.data,
        "poste_payement": amountPostePayemnt.data.data,
        "topnet": amountTopnet.data.data
      },
      "CA":ca,
      "Nombre_transaction":nbT,
      // "Stats_Commission":statsDataCommission.data.data,
      "Stats_by_month": statsDataAllMonth.data.data

    });






  } catch (error) {
    if(!error.response){
      log4j.loggererror.error(error.message)
      return res.status(500).send({"error":error.message});
    }
    log4j.loggererror.error("Error: ")
    return res.status(error.response.status).send(error.response.data);
  }

  });






  };
