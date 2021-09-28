const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')
const superagent = require('superagent');
const axios = require('axios');
const mail = require("../../../services/emails/emailProvider");
const mailSimple = require("./mailer.config.js")

const { user } = require('express-gateway/lib/services/');
const CircularJSON = require('circular-json');

const jwt = require('jsonwebtoken');
const env = require("../../../config/env.config");
// const validation = require("./validation");
const config = require('express-gateway/lib/config/');
const tokenService = services.token;
const authService = services.auth;

const log4j = require("../../../config/configLog4js.js");
const validation = require("../middleware/validation")
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


const varlb = require("../../../config/var.config");
const status_code = require("../config")
const data = [
  {
    VISITOR :  'visitor'
  }
  ,
  {

    AGENT : 'agent' 
  }
  ,//CREATED BY PDV
  {

    USER : 'user'
  }
  ,//PDV
  {

    ADMIN : 'admin'
  }
  ,
  {

    SUPPORT :   'support'
  }
  ,
  {

    COMMERCIAL :   'commercial' 
  }
  ,
  {

    COMPTABLE :   'comptable' ,

  }
]
const bodyParser = require("body-parser");
const app = express();
var corsOptions = {
  origin: "*"
};
var status = {
  "incompleted": 0,
  "completed": 1
}
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

    const getProfileByEmail = async (email) => {
      try {
        log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=` + email)
      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ status: "Error", error: error.message, code: status_code.CODE_ERROR.SERVER });

        }
        log4j.loggererror.error("Error in getProfile :" + error.response.data)
        return res.status(error.response.status).send(error.response.data);
      }
    }

    const getProfileByPhone = async (phone) => {
      try {
        log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?phone=` + phone)
      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ status: "Error", error: error.message, code: status_code.CODE_ERROR.SERVER });

        }
        log4j.loggererror.error("Error in getProfile :" + error.response.data)
        return res.status(error.response.status).send(error.response.data);
      }
    }
      //////////////////////////////////////////////////////////////////////////////////
      const addWallet = async (body) => {

        try {
          log4j.loggerinfo.info("Call addWallet in wallet " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`);
          console.log("bodyyyyyyyyy", body)
          // body.updated_by = id
          // body.updatedBy = id
          return await axios.post(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet` , body
          )
        } catch (error) {
          console.log("error",error)
          console.log("error.response",error.response)
          console.log("error.response.data",error.response.data)
          console.log("error.message",error.message)


          if (!error.response) {
            const message = {
              data : error.response
            }
            log4j.loggererror.error(error.message)
            return message
          }else {
            const message = {
              status:error.response.status,
              data : error.response.data
            }
          log4j.loggererror.error("Error in addWallet: ,error",error)
          // return res.status(error.response.status).send(error.response.data);
            return message
          }


        }
      }
      //////////////////////////////////////////////////////////////////////////////////
      const getCurrency = async () => {
        try {
          log4j.loggerinfo.info("Call getCurrency: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency` );

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency` )
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getCurrency: " + error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////////////////////////////////////////////////////////////////////

    gatewayExpressApp.post('/register', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        const { firstname, username, lastname, email, phone, } = req.body
        const { image, patent, photo, cin, commercial_register, city, zip_code, adresse, activity, updated_by, id_commercial } = req.body

        // // Validate against a password string
        // if (validation.validatePassword(password) == false) {
        //   log4j.loggererror.error("Unkown error.")
        //   return res.status(400).json({status:"Error",error: "password is not the correct format"});
        // }
        // if (password != password_confirmation) {
        //   log4j.loggererror.error("Unkown error.")
        //   return res.status(400).json({status:"Error",error: "password does not much"});

        // }

        // Verifier mail et phone **************************

        if (!email) {
          return res.status(400).json({ status: "Error", error: "email is required", code: status_code.CODE_ERROR.REQUIRED });
  
        }
        if (!phone) {
          return res.status(400).json({ status: "Error", error: "phone is required", code: status_code.CODE_ERROR.REQUIRED });
  
        }

        const getProfiled = await getProfileByEmail(email)
        console.log("getProfile", getProfiled.data)
        if (getProfiled.data.status == 'success') {
          console.log("getProfiled.data.data", getProfiled.data.data)

          if (getProfiled.data.data.data[0]) {
            return res.status(200).json({ status: "Error", error: "Email already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
          }

        } else {
          return res.status(200).json({ message: getProfiled.data });

        }
        const getProfiledByPhone = await getProfileByPhone(phone)
        console.log("getProfiledByPhone", getProfiledByPhone.data)
        if (getProfiledByPhone.data.status == 'success') {
          console.log("getProfiledByPhone.data.data", getProfiledByPhone.data.data)

          if (getProfiledByPhone.data.data.data[0]) {
            return res.status(200).json({ status: "Error", error: "Phone already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
          }

        } else {
          return res.status(200).json({ message: getProfiledByPhone.data });

        }
        // *********************************************

        // console.log("2222222222222222")

        // let teeeest = await services.user.findAll()
        // console.log("333333333333")

        // let test = await services.user.findByUsernameOrId(username)

        // let test = await services.user.getEmail(email)
        // console.log("testttttttttttttttttttt1111111")

        // console.log("testttttttttttttttttttt",test)

        var randomPassword = Math.random().toString(36).slice(-8);
        console.log("randomPassword", randomPassword)

        const myUserJwt = await jwt.sign({ username: username, password: randomPassword }, `${env.JWT_SECRET}`, {
          issuer: 'express-gateway',
          audience: 'something',
          expiresIn: 180000,
          subject: '3pXQjeklS3cFf8OCJw9B22',
          algorithm: 'HS256'
        });

        console.log("myUserJwt", `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`)

        myUser = await services.user.insert({
          isActive: false,
          confirmMail: false,
          profilCompleted: true,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          role: "ROLE_USER",
          team: false,
          redirectUri: 'https://www.khallasli.com',
          confirm_token: myUserJwt
        })


        const getType = async (code) => {
          try {
            log4j.loggerinfo.info("Call getType: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in getType: " + error.response.data)

            return res.status(error.response.status).send(error.response.data);
          }
        }
        console.log("myUser", myUser)

        const dataType = await getType("10");
        // console.log("dataType", dataType)
        if (!dataType.data.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }


        const creteProfile = async (myUser, body) => {
          try {
            log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`, {
              id_user: myUser.id,
              first_name: myUser.firstname,
              last_name: myUser.lastname,
              phone: myUser.phone,
              typeId: dataType.data.data.id,
              created_by: myUser.id,

              image: body.image,
              patent: body.patent,
              patent: body.photo,
              cin: body.cin,
              commercial_register: body.commercial_register,
              city: body.city,
              zip_code: body.zip_code,
              adresse: body.adresse,
              activity: body.activity,
              id_commercial: body.id_commercial,

              isActive: false,
              confirmMail: false,
              team: false,
              profilCompleted: true,
              username: username,
              email: email,
              role: "ROLE_USER",

            })
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in createProfile :" + error.response.data)

            const deleted = services.user.remove(myUser.id);

            return res.status(error.response.status).send(error.response.data);
          }
        }



        crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: randomPassword,
          scopes: []
        })
        console.log("crd_basiiiiiiiiiiic", crd_basic)

        crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['user'] })
        console.log("crd_oauth222222222222", crd_oauth2)

        // ****************************create_profile *********************************
        const body = {
          image: image,
          patent: patent,
          patent: photo,
          cin: cin,
          commercial_register: commercial_register,
          city: city,
          zip_code: zip_code,
          adresse: adresse,
          activity: activity,
          id_commercial: id_commercial
        }
        const userProfile = await creteProfile(myUser, body);
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }


        // console.log("aaaa", userProfile)
        if (userProfile.data.status == "error") {
          // services.user.remove()
          log4j.loggererror.error("Error in adding profile: " + userProfile.data)

          //console.log("aaaa iciii ",myUser.id)
          return res.status(400).json(userProfile.data);
        }

        // create 

        myProfile = await services.application.insert({
          name: "complete_profile" + myUser.id,
          redirectUri: `${env.baseURL}:5000/api/profile`
        }, myUser.id)

        console.log("email", username)
        console.log("password", randomPassword)
        console.log("crd_oauth2.id", crd_oauth2.id)
        console.log("crd_oauth2.secret", crd_oauth2.secret)

        var origin = req.headers.origin;
        console.log("req.headers.origin ", req.headers.origin)

        // const confirm_uri = `${env.baseURL}:${env.HTTP_PORT}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
        if (origin) {
          var url = origin
        } else {
          var url = `${env.baseURL}:${env.HTTP_PORT}`
        }

        // const confirm_uri = `${url}/signin?username=` + username + "&" + "confirm_token=" + myUserJwt;

        //here je vais envoyer un mail
        const confirm_uri = `${url}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
        mail.sendMail("Confirmation of your registration", "Veuillez cliquer sur lien pour confirmer votre mail \n ", confirm_uri, req.body.email, username,firstname ,lastname,randomPassword);

        const change_password_uri = `${url}/change-password`;

        // mail.sendChangePassword("Change password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " ) \n ", change_password_uri, req.body.email, username, randomPassword);

        // console.log("change_password_uri", change_password_uri)

        console.log("confirm_uri", confirm_uri)

        // mail.send_email("confirmation", "Veuillez cliquer sur lien pour completer votre compte \n " + confirm_uri,req.body.email);
        // mail.sendMailConfirm("imen.hassine96@gmail.com",myUserJwt);
        //console.log("mail",mail)
        log4j.loggerinfo.info("Success, mail has been sent to : " + email);
        return res.status(201).json({ etat: "Success", message: "Check your email : " + email });
      } catch (err) {
        log4j.loggererror.error("Error :" + err.message)
        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.post('/registration-confirm', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        console.log("/registration-confirm")
        const { username, confirm_token } = req.query
        console.log("/req.query", req.query)
        console.log("/req.body", req.body)


        const user = await services.user.findByUsernameOrId(username)
        console.log("***********************************")

        console.log("user", user)
        console.log("confirm_token", confirm_token)
        console.log("***********************************")
        //////////////////////////////////////////////////////////////////////////////////
        const getProfile = async (myUser) => {
          try {
            log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
  
            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?id_user=` + myUser.id)
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in getProfile :" + error.response.data)
            return res.status(error.response.status).send(error.response.data);
          }
        }
        //////////////////////////////////////////////////////////////////////////////////

        const updateprofile = async (body, id) => {

          try {
            log4j.loggerinfo.info("Call updateProfile in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
            console.log("bodyyyyyyyyy", body)
            body.updated_by = id
            body.updatedBy = id
            return await axios.patch(
              `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
            )
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in adding profile: ")
  
            return res.status(error.response.status).send(error.response.data);
          }
        }

        //////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////
        console.log("user***-----", user)


        console.debug('confirmation', user, req.query, confirm_token, username)
        if (user == false) { // username does not exist
          console.debug('wrong confirmation token')
          log4j.loggererror.error("wrong confirmation token")
          return res.status(200).json({ error: "wrong confirmation token" });
        }

        myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasic", myCredBasic)

        let decoded;
        try {
          decoded = await jwt.verify(confirm_token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
          console.log("***********************************")

          console.log("decoded", decoded)
          console.log("***********************************")

          if (!decoded) {
            console.debug('wrong confirmation token')
            log4j.loggererror.error("wrong confirmation token")

            return res.status(200).json({ error: "wrong confirmation token" });

          } else {
            if (user.username != decoded.username) {
              console.debug('???wrong confirmation token')
              log4j.loggererror.error("???wrong confirmation token")

              return res.status(200).json({ error: "wrong confirmation token" });

            }
            const passBooleanTrue = await utils.compareSaltAndHashed(decoded.password, myCredBasic.password)

            if (!passBooleanTrue) {
              log4j.loggererror.error("???wrong confirmation token")

              return res.status(200).json({ error: "wrong confirmation token" });

            }
          }
        } catch (error) {
          console.log("***********************************")

          console.log("error", error)
          console.log("***********************************")

          // res.status(403).send(error);
          log4j.loggererror.error("Error in adding profile: " + error.message)

          return res.status(400).json({ error: error.message });
        }
        // user_res = await services.user.activate(user.id)
        console.log("user_res")

        // user_res = await services.user.update(user.id, { confirmMail: 'true',confirm_token: "" }) //test this
        user_res = await services.user.update(user.id, { confirmMail: 'true' }) //test this
        // user_res = await services.user.update(user.id, { confirm_token: '' }) //test this


        console.log("user_res", user_res)
        // user = await services.user.findByUsernameOrId(email)
        /////////////////////////////
        const getProfiled = await getProfile(user)
        console.log("getProfile", getProfiled.data)
        if(getProfiled.data.data.data.length==0){
          return res.status(200).json({ status: "Error",message: "profile does not existe with id_user",code: status_code.CODE_ERROR.NOT_EXIST  });
        }
        //////////////////////////////////////////
        const updateBody = {
            confirmMail: true
        }
        /////////////////////
        // updateBody.company.profilCompleted = true
        console.log("getProfiled.data.data.data[0].id-----", getProfiled.data.data.data[0].id)

        let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id);
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }
        ///////////////////////////////////
        return res.status(200).json({ etat: "Success" });

      } catch (err) {
        log4j.loggererror.error("Error in adding profile: " + err.message) //ici

        return res.status(422).json({ error: err.message })
      }
    });


    gatewayExpressApp.patch('/complete-profile/:id', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
      try {
        console.log("/api/complete-profile")
        if (!req.params.id) {
          console.log("*********************************", req.body)
          return res.status(200).json({ error: "Id can not be empty" })

        }
        const { image, patent, photo, cin, commercial_register, city, zip_code, adresse, activity, updated_by, id_commercial } = req.body

        const updateprofile = async (body) => { //with id user

          try {
            log4j.loggerinfo.info("Call updateProfile in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/`);
            console.log("bodyyyyyyyyy", body)
            body.updated_by = req.params.id
            body.updatedBy = req.params.id
            return await axios.patch(
              `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/` + req.params.id, body
            )
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in adding profile: ")

            return res.status(error.response.status).send(error.response.data);
          }
        }
        console.log("req.ody", req.body)
        req.body.company.profilCompleted = true
        let userProfile = await updateprofile(req.body);
        if (!userProfile.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }
        user_res = await services.user.update(req.params.id, { profilCompleted: 'true' }) //test this

        log4j.loggerinfo.info("Success");

        return res.status(200).json({ etat: "success", message: "Wait for the admin to accept your profile ", data: userProfile.data });

      } catch (err) {
        log4j.loggererror.error("Error in adding profile: " + userProfile.data)
        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.post('/agent-register', verifyTokenAdmin, async (req, res, next) => { // incomplete {add send mail with url /change_password} 
      try {
        const { firstname, username, lastname, email, phone, idOwner } = req.body
        console.log("/api/agent-register")

        console.log("req.headers.authorization", req.headers.authorization)
        agentUser = await services.user.insert({
          isActive: true,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          team: false,
          redirectUri: 'https://www.khallasli.com',
        })

        const createAgentProfile = async (agentUser) => {

          try {
            log4j.loggerinfo.info("Call postProfile agent: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`
              , {
                ///profile-by-company
                idOwner: idOwner,
                id_user: agentUser.id,
                first_name: agentUser.firstname,
                last_name: agentUser.lastname,
                phone: agentUser.phone,
                team: false,
                email: agentUser.email,
                isActive: true,
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
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in adding profile: ")
            const deleted = services.user.remove(myUser.id);

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
          return res.status(500).json({ "Error": "Problem in server" });

        }
        if (userProfile.data.status == "error") {
          log4j.loggererror.error("Error in adding profile: " + userProfile.data)

          return res.status(200).json(userProfile.data);
        }

        mailSimple.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " )", req.body.email);

        return res.status(201).json({ etat: "Success", message: "We have sent an email to " + agentUser.email + " to set a new password" });


      } catch (err) {
        log4j.loggererror.error("Error in adding profile: ")

        return res.status(422).json({ error: err.message })
      }
    });

    gatewayExpressApp.post('/team-register', async (req, res, next) => { // incomplete {add send mail with url /change_password} 
      try{
      const { firstname, username, lastname, email, phone, type_code } = req.body

      if (!email) {
        return res.status(400).json({ status: "Error", error: "email is required", code: status_code.CODE_ERROR.REQUIRED });

      }
      if (!phone) {
        return res.status(400).json({ status: "Error", error: "phone is required", code: status_code.CODE_ERROR.REQUIRED });

      }
      if (!type_code) {
        return res.status(400).json({ status: "Error", error: "type_code is required", code: status_code.CODE_ERROR.REQUIRED });

      }
      // const getProfiled = await getProfileByEmail(email)
      // console.log("getProfile", getProfiled.data)
      // if (getProfiled.data.status == 'success') {
      //   console.log("getProfiled.data.data", getProfiled.data.data)

      //   if (getProfiled.data.data.data[0]) {
      //     return res.status(200).json({ status: "Error", error: "Email already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
      //   }

      // } else {
      //   return res.status(200).json({ message: getProfiled.data });

      // }
      // const getProfiledByPhone = await getProfileByPhone(phone)
      // console.log("getProfiledByPhone", getProfiledByPhone.data)
      // if (getProfiledByPhone.data.status == 'success') {
      //   console.log("getProfiledByPhone.data.data", getProfiledByPhone.data.data)

      //   if (getProfiledByPhone.data.data.data[0]) {
      //     return res.status(200).json({ status: "Error", error: "Phone already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
      //   }

      // } else {
      //   return res.status(200).json({ message: getProfiledByPhone.data });

      // }

      // console.log("2222222222222222")

      // let teeeest = await services.user.findAll()
      // console.log("333333333333")

      // let test = await services.user.findByUsernameOrId(username)

      // let test = await services.user.getEmail(email)
      // console.log("testttttttttttttttttttt1111111")

      // console.log("testttttttttttttttttttt",test)

      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)

      const myUserJwt = await jwt.sign({ username: username, password: randomPassword }, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: 180000,
        subject: '3pXQjeklS3cFf8OCJw9B22',
        algorithm: 'HS256'
      });

      console.log("myUserJwt", `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`)

      const getType = async (code) => {
        try {
          log4j.loggerinfo.info("Call getType: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getType: " + error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }

      const dataType = await getType(type_code);
      console.log("dataType.data.data", dataType.data)
      if (!dataType.data.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).json({ "Error": "Problem in server" });

      }

      const code = dataType.data.data.type
      const type = dataType.data.data.id

      myUser = await services.user.insert({
        isActive: true,
        confirmMail: false,
        profilCompleted: true,
        firstname: firstname,
        lastname: lastname,
        username: username,

        email: email,
        phone: phone,
        role: "ROLE_"+code.toUpperCase(),
        team: true,
        
        redirectUri: 'https://www.khallasli.com',
        confirm_token: myUserJwt
      })
      console.log("myUser", myUser)

      const creteProfile = async (myUser) => {
        try {
          log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

          return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`, {
            id_user: myUser.id,
            first_name: myUser.firstname,
            last_name: myUser.lastname,
            phone: myUser.phone,
            typeId: type,
            created_by: myUser.id,
            
            team: true,
            isActive: true,
            confirmMail: false,
            profilCompleted: true,
            username: username,
            email: email,
            role: "ROLE_"+code.toUpperCase(),

          })
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in createProfile :" + error.response.data)

          const deleted = services.user.remove(myUser.id);

          return res.status(error.response.status).send(error.response.data);
        }
      }



      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: randomPassword,
        scopes: []
      })
      console.log("crd_basiiiiiiiiiiic", crd_basic)

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: [code] })
      console.log("crd_oauth222222222222", crd_oauth2)

      // ****************************create_profile *********************************

      const userProfile = await creteProfile(myUser);
      console.log("iciiiiiuserProfile",userProfile)
      if (!userProfile.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).json({ "Error": "Problem in server" });

      }


      // console.log("aaaa", userProfile)
      if (userProfile.data.status == "error") {
        // services.user.remove()
        log4j.loggererror.error("Error in adding profile: " + userProfile.data)

        //console.log("aaaa iciii ",myUser.id)
        return res.status(400).json(userProfile.data);
      }

      // create 

      myProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: `${env.baseURL}:5000/api/profile`
      }, myUser.id)

      console.log("email", username)
      console.log("password", randomPassword)
      console.log("crd_oauth2.id", crd_oauth2.id)
      console.log("crd_oauth2.secret", crd_oauth2.secret)

      var origin = req.headers.origin;
      console.log("req.headers.origin ", req.headers.origin)

      // const confirm_uri = `${env.baseURL}:${env.HTTP_PORT}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
      if (origin) {
        var url = origin
      } else {
        var url = `${env.baseURL}:${env.HTTP_PORT}`
      }

      // const confirm_uri = `${url}/signin?username=` + username + "&" + "confirm_token=" + myUserJwt;

      //here je vais envoyer un mail
      const confirm_uri = `${url}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
      mail.sendMail("Confirmation", "Veuillez cliquer sur lien pour confirmer votre mail \n ", confirm_uri, req.body.email, username);

      const change_password_uri = `${url}/change-password`;

      mail.sendChangePassword("Change password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " ) \n ", change_password_uri, req.body.email, username, randomPassword);

      console.log("confirm_uri", confirm_uri)
      console.log("change_password_uri", change_password_uri)

      // mail.send_email("confirmation", "Veuillez cliquer sur lien pour completer votre compte \n " + confirm_uri,req.body.email);
      // mail.sendMailConfirm("imen.hassine96@gmail.com",myUserJwt);
      //console.log("mail",mail)
      log4j.loggerinfo.info("Success, mail has been sent to : " + email);
      return res.status(201).json({ etat: "Success", message: "Check your email : " + email });
    } catch (err) {
      log4j.loggererror.error("Error :" + err.message)
      return res.status(422).json({ error: err.message })
    }
    });

    gatewayExpressApp.patch('/activate/:id', async (req, res, next) => { //endpoint pour activer
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
      /************************************ */

      const getProfile = async (myUser) => {
        try {
          log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?username=` + myUser)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }
      /************************************ */
      const updateprofile = async (body, id) => {

        try {
          log4j.loggerinfo.info("Call updateProfile in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
          console.log("bodyyyyyyyyy", body)
          body.updated_by = id
          body.updatedBy = id
          return await axios.patch(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
          )
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in adding profile: ")

          return res.status(error.response.status).send(error.response.data);
        }
      }
      //////////////////////////////////////////////////////////////////////////////////

      /////////////////////////////

      const getProfiled = await getProfile(req.params.id)
      console.log("getProfile", getProfiled.data)
      if (getProfiled.data.status == 'success') {
        console.log("myUser.id", myUser.id)

        if (code == 10) {
          myUser = await services.user.deactivate(myUser.id)
          if (myUser == true) {
            log4j.loggererror.error("Unkown error.")
            /////////////////////
            console.log("id", getProfiled.data.data.data[0].id)

            const updateBody = {
              isActive: false
            }
            console.log("*************************************************************************************")
            console.log("getProfiled.data.data.data[0].id_user", getProfiled.data.data.data[0].id)
            console.log("*************************************************************************************")

            let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id);
            if (!userProfile.data) {
              log4j.loggererror.error("Error Problem in server ")
              return res.status(500).json({ "Error": "Problem in server" });

            }
            ////////////////////////////////////
            return res.status(200).json({ message: "The user has been desactivated" });
          }

        } else if (code == 11) {

          myUser = await services.user.activate(myUser.id)
          if (myUser == true) {
            log4j.loggererror.error("Unkown error.")
            /////////////////////
            console.log("id", getProfiled.data.data.data[0].id)

            const updateBody = {
              isActive: true
            }
            console.log("*************************************************************************************")
            console.log("getProfiled.data.data.data[0].id_user", getProfiled.data.data.data[0].id)
            console.log("*************************************************************************************")

            let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id);
            if (!userProfile.data) {
              log4j.loggererror.error("Error Problem in server ")
              return res.status(500).json({ "Error": "Problem in server" });

            }
            ////////////////////////////////////
            console.log("userProfile.data", userProfile.data)
            return res.status(200).json({ message: "The user has been activated" });
          }
        }

        return res.status(200).json({ message: "The visitor has been refused" });

      } else {
        return res.status(200).json({ message: getProfiled.data });

      }


    });

    gatewayExpressApp.patch('/update_role/:id', async (req, res, next) => {

      const { role } = req.body // code = 10 desactive , 11 active // id is a username

      if (!role) {
        log4j.loggererror.error("Unkown error.")

        return res.status(200).json({ error: "role can not be empty " });

      }
      myUser = await services.user.find(req.params.id)
      console.log("myUser", myUser)

      if (myUser == false) {
        log4j.loggererror.error("User does not exist")
        return res.status(200).json({ status: "error", message: "The user does not exist" });
      }
      else {

        myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2')
        console.log("******************Scopeeeeeee******************")
        console.log("old myCredOauth", myCredOauth)
        console.log("************************************")

        let scope = myCredOauth.scopes;
        console.log("******************Scopeeeeeee******************")
        console.log("old scope", scope)
        console.log("************************************")

        myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2')
        let roles = []
        roles[0] = role
        crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: roles })

        console.log("crd_oauth2 ", crd_oauth2)


        myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2')



        // return res.status(200).json({ status: "success", message: "The user has been updates", role: "ROLE_"+myCredOauth.scopes.toUpperCase() });
        return res.status(200).json({ status: "success", message: "The user has been updates", role:myCredOauth.scopes });


      }




    });

    gatewayExpressApp.patch('/accept/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { //accept or refuser a visitor (means give a visitor a role as a user)
      //accept or refuse a pdv 
      console.log("iciiiiibbbbbbbbbb")
      const getProfile = async (myUser) => {
        try {
          log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?id_user=` + myUser.id)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }
      const deleteCompany = async (idCompany, deletedByUser) => {
        try {
          console.log("idCompany", idCompany)
          console.log("deletedByUser", deletedByUser)
          log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
          // const bodyCompany
          return await axios.delete(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/` + idCompany, { data: req.body })
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in deleteProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }
      const updateprofile = async (body, id) => {

        try {
          log4j.loggerinfo.info("Call updateProfile in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
          console.log("bodyyyyyyyyy", body)
          body.updated_by = id
          body.updatedBy = id
          return await axios.patch(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
          )
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in adding profile: ")

          return res.status(error.response.status).send(error.response.data);
        }
      }
      const { code } = req.body // code = 10 delete , 11 accept // id is a username
      console.log("Bodyyy in accepte endpint ", req.body)
      if (!code) {
        log4j.loggererror.error("Role can not be empty")

        return res.status(200).json({ error: "Role can not be empty " });

      }
      myUser = await services.user.find(req.params.id)
      console.log("myUser", myUser)

      if (myUser == false) {
        log4j.loggererror.error("User does not exist")
        return res.status(200).json({ status: "error", message: "The user does not exist" });
      }
      else {

        const getProfiled = await getProfile(myUser)
        console.log("getProfile", getProfiled.data)

        if (code == 10) {

          const deleted = services.user.remove(myUser.id);
          if (getProfiled.data.status == 'success') {
            console.log("CompanyId", getProfiled.data.data.data[0].CompanyId)
            console.log("myUser.id", myUser.id)

            const deletedCompany = await deleteCompany(getProfiled.data.data.data[0].CompanyId, myUser.id)
            console.log("deletedCompany", deletedCompany.data)

            log4j.loggererror.error("The user has been refused")

            return res.status(200).json({ status: "success",message: "The user has been refused" });

          } else {
            return res.status(200).json({ message: getProfiled.data });

          }

        } else if (code == 11) {

          myUserUpdated = await services.user.activate(myUser.id)
          if (myUserUpdated == true) {
            //Update profile status///////////
            const updateBody = {
              isActive: true
            }
            console.log("aaaa update",getProfiled.data.data.data[0].id)
            let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id);


            if (!userProfile.data) {
              log4j.loggererror.error("Error Problem in server ")
              return res.status(500).json({ "Error": "Problem in server" });
  
            }

            ////generate pswd/////////
            var randomPassword = Math.random().toString(36).slice(-8);
            console.log("randomPassword", randomPassword)

            let myCredBasic = await services.credential.removeCredential(myUser.id, 'basic-auth')
            myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')
            console.log("myCredBasic", myCredBasic)
            const crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
              autoGeneratePassword: false,
              password: randomPassword,
              scopes: []
            })
            /////get currency///////////
            const dataCurrency = await getCurrency();
            console.log("dataCurrency",dataCurrency.data)
            if (!dataCurrency.data.data) {
              log4j.loggererror.error("Error Problem in server ")
              return res.status(500).json({ "Error": "Problem in server" });
    
            }
            const currencyId = dataCurrency.data.data.items[0].id
            /////add wallet///////////
            const companyId = getProfiled.data.data.data[0].CompanyId

            const dataWallet = await addWallet({
              balance:"0",
              companyId:companyId,
              currencyId:currencyId,
              createdBy:req.body.createdBy,

          
            });

            console.log("dataWaccccccllet",dataWallet)

            if(dataWallet.data.status == "error"){
            return res.status(dataWallet.status).json({ status: dataWallet.data.status, message:dataWallet.data.message });

            }
            
            var origin = req.headers.origin;
            console.log("req.headers.origin ", req.headers.origin)
  
            if (origin) {
              var url = origin
            } else {
              var url = `${env.baseURL}:${env.HTTP_PORT}`
            }
    
            const change_password_uri = `${url}/change-password`;
    
            console.log("change_password_uri", change_password_uri)
  
            // mailSimple.send_email("confirmation", "Votre compte a été approuvé par l'admin \n ", myUser.email);
            mail.sendMailAdminConfirmation("confirmationByAdmin",change_password_uri, myUser.email,myUser.firstname,myUser.lastname,myUser.username,randomPassword);
  
            return res.status(200).json({ status: "success", message: "The user has been accepted" });
            }else {
            return res.status(200).json({ status: "Error", message: "The user has not been accepted" });

            }

        }


      }




    });
    gatewayExpressApp.post('/admin-register', verifyTokenSuperAdmin, async (req, res, next) => {
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
          team: true,
          redirectUri: 'https://www.khallasli.com',
        })
        ////////////
        var randomPassword = Math.random().toString(36).slice(-8);
        console.log("randomPassword", randomPassword)


        //////////////
        const getType = async (code) => {
          try {
            log4j.loggerinfo.info("Call getType agent: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in adding profile: " + userProfile.data)

            return res.status(error.response.status).send(error.response.data);
          }
        }
        const dataType = await getType("20")
        if (!dataType.data.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }
        /////////////
        // console.log("aaaaaaaaaa dataType",dataType)

        const createAgentProfile = async (agentUser) => {

          try {
            log4j.loggerinfo.info("Call post Profile agent: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`);

            return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`, {
              id_user: agentUser.id,
              first_name: agentUser.firstname,
              last_name: agentUser.lastname,
              phone: agentUser.phone,
              typeId: dataType.data.data.id,
              created_by: agentUser.id

            })
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in adding profile: " + userProfile.data)
            const deleted = services.user.remove(myUser.id);

            return res.status(error.response.status).send(error.response.data);

          }
        }
        //////////////
        // let userProfile;
        let userProfile = await createAgentProfile(myUser)
        if (!userProfile.data.data) {
          log4j.loggererror.error("Error Problem in server ")
          return res.status(500).json({ "Error": "Problem in server" });

        }
        console.log("aaaaaaaaaa userProfile", userProfile.response)
        if (userProfile.data.status == "error") {
          log4j.loggererror.error("Error in adding profile: " + userProfile.data)

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

        mailSimple.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " )", req.body.email);
        log4j.loggerinfo.info("Admin has been successfuly created, we have sent an email to " + email + " to set a new password");

        return res.status(201).json({ etat: "Success", message: "Admin has been successfuly created, we have sent an email to " + email + " to set a new password" });


      } catch (err) {
        log4j.loggererror.error("Error in adding profile: " + userProfile.data)

        return res.status(422).json({ error: err.message })
      }
    });


    async function verifyToken(req, res, next) {

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


            body.created_by = decoded.consumerId
            body.deleted_by = decoded.consumerId
            body.updated_by = decoded.consumerId

            body.createdBy = decoded.consumerId
            body.deletedBy = decoded.consumerId
            body.updatedBy = decoded.consumerId
            next()
          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
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
    async function verifyTokenUser(req, res, next) {
      let body = req.body

      ///////////////////////////////////////////////////////////////////////////
      const getProfile = async (id) => {
        try {
          log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getting profile: " + error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////
      const getWallet = async (idCompany) => {
        try {
          log4j.loggerinfo.info("Call getWallet: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`,
            {
              params: {
                companyId: idCompany
              }
            })
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getting getWallet: " + error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
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


            body.created_by = decoded.consumerId
            body.deleted_by = decoded.consumerId
            body.updated_by = decoded.consumerId

            body.createdBy = decoded.consumerId
            body.deletedBy = decoded.consumerId
            body.updatedBy = decoded.consumerId
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
              /**************************** */

              var data;
              try {
                data = await getProfile(req.body.userId)

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
                    dataWallet = await getWallet(data.data.data.CompanyId)

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
                    console.log("iiiiiiiiii")
                    body.walletId = dataWallet.data.data.data.items[0].id

                  }
                  else {
                    console.log("vvvvvv")
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
            res.send({ "error": error.message });

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
            let body = req.body

            body.userId = decoded.consumerId


            body.created_by = decoded.consumerId
            body.deleted_by = decoded.consumerId
            body.updated_by = decoded.consumerId

            body.createdBy = decoded.consumerId
            body.deletedBy = decoded.consumerId
            body.updatedBy = decoded.consumerId
          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
          }
          let myCredOauth;
          try {
            myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          } catch (error) {
            console.log("error", error)
            res.send({ "error": error.message });

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
            let body = req.body

            body.userId = decoded.consumerId


            body.created_by = decoded.consumerId
            body.deleted_by = decoded.consumerId
            body.updated_by = decoded.consumerId

            body.createdBy = decoded.consumerId
            body.deletedBy = decoded.consumerId
            body.updatedBy = decoded.consumerId

          } catch (error) {
            console.log("error", error)
            res.status(403).send(error);
          }
          let myCredOauth;
          try {
            myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
          } catch (error) {
            console.log("error", error)
            res.send({ "error": error.message });

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
      console.log("zzzzz", corsOptions)

      myUser = await services.user.find(username)
      console.log("myUser", myUser)
      // myUserUpdte = await services.user.update(myUser.id,"firstname")

      if (myUser == false) {
        log4j.loggerinfo.info("Error username does not exist.");

        return res.status(200).json({ status: "Error", error: "username does not exist", code: status_code.CODE_ERROR.NOT_EXIST });

      }
      else if (myUser.confirmMail == 'false') {
        log4j.loggererror.error("Error please confirm your email ")

        return res.status(200).json({ status: "Error",error: "Confirm your email" ,code: status_code.CODE_ERROR.CONFIRM_MAIL});

      }

      // else if (myUser.profilCompleted == 'false') {
      //   log4j.loggerinfo.info("Error user profile is incompleted. ");

      //   return res.status(200).json({ error: "user profile is incompleted." });

      // }
      else if (myUser.isActive == false) {
        log4j.loggerinfo.info("Error user is desactivated. please wait for the administrator's agreement ");

        return res.status(200).json({ status: "Error", error: "user is desactivated. please wait for the administrator's agreement ", code: status_code.CODE_ERROR.USER_DESACTIVATE });

      }

      myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')

      console.log("myCredBasic ", myCredBasic)

      const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password)
      if (!passBooleanTrue) {
        log4j.loggererror.error("Error Wrong password")

        return res.status(200).json({ status: "Error", error: "Wrong password", code: status_code.CODE_ERROR.INCORRECT_PASSWORD });

      }

      myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2')
      let scope = myCredOauth.scopes;
      console.log("******************Scopeeeeeee******************")

      console.log("scope", scope)
      console.log("************************************")

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
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getToken: " + error.response.data)

          return res.status(error.response.status).send({ status: "Error", error: error.response.data });
        }
      }
      // here should get the token and applique invoke before generating a new one
      let token;
      try {

        token = await getToken(username, password, crd_oauth2.id, crd_oauth2.secret)

      } catch (error) {
        log4j.loggererror.error("Error :" + error.message)

        console.log("Error", error.message)
        return res.status(500).send({ status: "Error", "error": error.message });

      }
      /////////////////////////////Get user info by username //////////////////////////////////
      const user = await services.user.findByUsernameOrId(myUser.id)
      console.log("******************userici****************")

      console.log("user", user.role)
      console.log("useruseruseruser", user)

      console.log("*****************************************")

      /////////// Check if it is a visitor ////////////////////
      let userJsonVisistor = {
        id: user.id,
        username: user.username,
        lastname: user.lastname,
        firstname: user.firstname,
        email: user.email,
        isActive: user.isActive,
        confirmMail: user.confirmMail,
        profilCompleted: user.profilCompleted,
        role: scope,

        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      if (scope[0] == 'ROLE_VISITOR') {
        // return res.status(token.status).json({ token: token.data, role: "ROLE_"+scope.toUpperCase(), user: userJsonVisistor, categoryWalletId: null });
        return res.status(token.status).json({ token: token.data, role: scope, user: userJsonVisistor, categoryWalletId: null });

      }
      // else
      // if(scope[0] == 'admin'){
      //   return res.status(token.status).json({ token: token.data, role: scope ,user: userJsonVisistor , categoryWalletId: null});
      // }
      else {


        ///////////////////////////////////////////////////////////////////////////
        const getProfile = async (id) => {
          try {
            log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id)
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ status: "Error", "error": error.message });
            }
            log4j.loggererror.error("Error in getting profile: " + error.response.data)

            return res.status(error.response.status).send({ status: "Error", error: error.response.data });
          }
        }
        ///////////
        const getCategoryFromWalletWithCode = async (code) => {
          try {
            log4j.loggerinfo.info("Call getcategory: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category/`);

            return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category?name=` + code)
          } catch (error) {
            if (!error.response) {
              log4j.loggererror.error(error.message)
              return res.status(500).send({ "error": error.message });
            }
            log4j.loggererror.error("Error in getting getcategory: " + error.response.data)

            return res.status(error.response.status).send({ status: "Error", error: error.response.data });
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

        } else if (md.os() === "AndroidOS") {
          console.log("is android");
        }

        var ip = (typeof req.headers['x-forwarded-for'] === 'string'
          && req.headers['x-forwarded-for'].split(',').shift()) ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress
        console.log("ip", ip)
        console.log("req.connection.remoteAddress", req.connection.remoteAddress)
        // console.log("lookup",lookup(ip)); // location of the user

        console.log("os.platform()", os.platform())
        console.log("os.release()", os.release())
        console.log("os.type()", os.type()); // "Windows_NT"

        console.log("req.device.type.toUpperCase()", req.device.type.toUpperCase())
        // console.log("iplocate",iplocate(ip)); // location of the user
        // console.log("iplocate",iplocate(ip).country); // location of the user
        // console.log(iplocate(ip)); // location of the user
        console.log("ipaddre", ipF.address());
        let addr = ipF.address()
        console.log("aaaaaaaaaaaaaaaaaaaa", addr)

        const publicIpAdd = await publicIp.v4();
        console.log("publicIpAdd", publicIpAdd)
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
        console.log("ua", ua)
        var isMobile = ua.isMobile
        console.log("isMobile", isMobile)

        let userUpdated = await services.user.update(myUser.id, {
          ip: publicIpAdd,
          os: os.platform(),
          source: ua.source,
          // // geoip: lookup(ip),
          // country:results.country,
          // city:results.city,
          // latitude:results.latitude,
          // longitude:results.longitude,

          last_login: new Date().toString()
        })
        console.log("userUpdated", userUpdated)
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

        console.log("addresses", addresses);
        ////////////////////////////

        /**************************** */

        var data;
        try {
          data = await getProfile(myUser.id)

        } catch (error) {
          console.log("error", error) //// tkt
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
          }
          log4j.loggererror.error("Error in getting profile: " + error.response.data)

          return res.status(error.response.status).send({ status: "Error", error: error.response.data });

        }
        /********************************************************************************************** */
        // console.log("data",data)
        console.log("*********************************")
        console.log("*********************************")
        console.log("**************/////////////////////*******************")
        var dataCategory;

        if (data.data) {
          console.log("iciiiiiiiiiiiiiiiiiiii", data.data)

          if (data.data.data) {
            console.log("data.data.data", data.data.data)
            if (data.data.data.Company) {
              if (data.data.data.Company.Category) {
                console.log("data.data.data.Company", data.data.data.Company)

                console.log("data.data.data.Category", data.data.data.Company.Category)
                if (data.data.data.Company.Category) {
                  var code = data.data.data.Company.Category.code
                  try {
                    dataCategory = await getCategoryFromWalletWithCode(code)

                  } catch (error) {
                    console.log("error", error) //// tkt
                    if (!error.response) {
                      log4j.loggererror.error(error.message)
                      return res.status(500).send({ "error": error.message });
                    }
                    log4j.loggererror.error("Error in getting profile: " + error.response.data)

                    return res.status(error.response.status).send({ status: "Error", error: error.response.data });

                  }
                }

              }
            }


          }
        }
        /************************************************************************************** */
        console.log("dataCategory", dataCategory)

        /************************************************************************************** */

        console.log("Date.now()", Date.now())
        let name = "complete_profile" + Date.now()
        // userApp = await services.application.find(name)


        myApp = await services.application.insert({
          name: "user_app" + Date.now(),
          ip: user.ip,
          source: user.source,
          os: user.os,
          latitude: user.latitude,
          longitude: user.longitude,
          city: user.city,
          country: user.country
        }, myUser.id)

        userApp = await services.application.find(name)
        console.log("userapp", userApp)
        console.log("myApp", myApp)

        let userJson = {
          id: user.id,
          username: user.username,
          lastname: user.lastname,
          firstname: user.firstname,
          email: user.email,
          isActive: user.isActive,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          application: {
            id: myApp.id,
            ip: user.ip,
            source: user.source,
            os: user.os,
            last_login: user.last_login,
            latitude: user.latitude,
            longitude: user.longitude,
            city: user.city,
            country: user.country
          }
        }

        if (token) {
          if (token.status == 200) {
            if (data.status == 200) {
              log4j.loggerinfo.info("Succes in getting token.");
              if (dataCategory) {
                console.log("dataCategory.data", dataCategory.data)

                console.log("dataCategory.data", dataCategory.data)
                console.log("dataCategory.data.data", dataCategory.data.data)




                if (dataCategory.data.data) {
                  return res.status(token.status).json({ token: token.data, role: scope, user: userJson, profile: data.data.data, categoryWalletId: dataCategory.data.data.items[0] });

                }
              }

              return res.status(token.status).json({ token: token.data, role: scope, user: userJson, profile: data.data.data, categoryWalletId: null });

            }

          }
        }
        else {
          log4j.loggererror.error("Error in getting profile")
          return res.status(500).send("error");

        }

        log4j.loggerinfo.info("Getting token");
        console.log("token.status", token.status)
        console.log("token", token.data)

        console.log("scope", scope)
        console.log("myUser", myUser)

        return res.status(token.status).json({ token: token.data, role: scope, user: myUser });


      }

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

      const email = req.body.email
      if (!email) {
        return res.status(400).json({ status: "Error", error: "email is required", code: status_code.CODE_ERROR.REQUIRED });

      }
      const getProfile = async (myUser) => {
        try {
          log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=` + myUser)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ status: "Error", error: error.message, code: status_code.CODE_ERROR.SERVER });

          }
          log4j.loggererror.error("Error in getProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }

      /////////////////////////////

      const getProfiled = await getProfile(email)
      console.log("********************************************************************************")
      console.log("getProfile", getProfiled.data)
      console.log("********************************************************************************")

      if (getProfiled.data.status == 'success') {

        if (!getProfiled.data.data.data[0]) {


          return res.status(200).json({ status: "Error", error: "User with this email does not exist", code: status_code.CODE_ERROR.NOT_EXIST });

        }

        /*********************************** */
        const username = getProfiled.data.data.data[0].username
        console.log("********************************************************************************")
        console.log("username", username)
        console.log("********************************************************************************")

        const user = await services.user.findByUsernameOrId(username)
        console.log("user", user)
        console.debug('confirmation', user, username)
        if (user == false) { // username does not exist
          console.debug('Username does not exist')
          log4j.loggererror.error("Error Username does not exist: ")

          return res.status(200).json({ status: "Error", error: "Username does not exist", code: status_code.CODE_ERROR.NOT_EXIST });
        }
        const myUserJwt = await jwt.sign({ username: username }, `${env.JWT_SECRET}`, {
          issuer: 'express-gateway',
          audience: 'something',
          expiresIn: 18000,
          subject: '3pXQjeklS3cFf8OCJw9B22',
          algorithm: 'HS256'
        });
        console.log("aaa", myUserJwt)

        console.log("req.header Referer", req.header('Referer'))
        console.log("req.headers['referer']", req.headers['referer'])
        console.log("req.header Referrer", req.get('Referrer'))
        console.log(" Referrer || Referer", req.headers.referrer || req.headers.referer
        )
        var host = req.headers.host;
        console.log("host ", host)
        var origin = req.headers.origin;
        console.log("req.headers.origin ", req.headers.origin)
        // const confirm_uri = `${env.baseURL}:${env.HTTP_PORT}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
        if (origin) {
          var url = origin
        } else {
          var url = `${env.baseURL}:${env.HTTP_PORT}`
        }
        const confirm_uri = `${url}/reset-password?username=` + username + "&" + "token=" + myUserJwt;
        console.log("confirm_uri", confirm_uri)
        //here je vais envoyer un mail
        mail.sendPasswordReset("Reset password", confirm_uri, user.email,user.firstname,user.lastname)
        // mailSimple.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe " + confirm_uri + " \n Link valable pour 5 heures", user.email);
        log4j.loggerinfo.info("Success check your email : " + user.email);

        return res.status(201).json({ etat: "Success", message: "Check your email : " + user.email + " for username " + username });
        /*********************************** */
      } else {





        return res.status(200).json({ etat: "Error", message: getProfiled.data, code: status_code.CODE_ERROR.INCONNU });








      }




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

            return res.status(403).json({ status: "Error", error: "wrong confirmation token" });
          } else {
            if (user.username != decoded.username) {
              console.debug('wrong confirmation token')
              log4j.loggererror.error("Error wrong confirmation token")

              return res.status(403).json({ status: "Error", error: "wrong confirmation token" });
            }

            if (password != password_confirmation) {
              log4j.loggererror.error("Error password does not much ")

              return res.status(200).json({ status: "Error", error: "password does not much" });
            }

            console.log("ddd")
          }
        } catch (error) {
          console.log("error", error.message)
          // res.status(403).send(error);
          log4j.loggererror.error("Error " + error.message)

          return res.status(400).json({ status: "Error", error: error.message });

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

        log4j.loggerinfo.info("Success.Votre mot de passe a été réinitialisé");

        return res.status(200).json({ etat: "Success" ,message:"Votre mot de passe a été réinitialisé"});
      } catch (err) {
        log4j.loggererror.error("Error: " + err.message)

        return res.status(422).json({ error: err.message })
      }

    });

    gatewayExpressApp.post('/change-password', verifyToken, async (req, res, done) => {

      try {
        console.log("/change-password")
        console.log("req.body", req.body)

        const { old_password, new_password, userId } = req.body
        console.log("old_password", old_password)
        console.log("new_password", new_password)
        if (!old_password) {
          return res.status(400).json({ status: "Error", error: "old_password is required", code: status_code.CODE_ERROR.REQUIRED });

        }
        if (!new_password) {
          return res.status(400).json({ status: "Error", error: "new_password is required", code: status_code.CODE_ERROR.REQUIRED });

        }
        const user = await services.user.findByUsernameOrId(userId)
        console.log("user", user)

        // console.debug('confirmation', user, req.query, token, username)
        if (user == false) { // username does not exist
          console.debug('wrong confirmation token')
          log4j.loggererror.error("Error wrong confirmation token")

          return res.status(200).json({ status: "Error", error: "wrong confirmation token", code: status_code.CODE_ERROR.NOT_EXIST });
        }

        let myCredBasicA = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasicssssssss", myCredBasicA)





        let myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')
        console.log("myCredBasic", myCredBasic)

        const passBooleanTrue = await utils.compareSaltAndHashed(old_password, myCredBasic.password)
        if (!passBooleanTrue) {
          log4j.loggererror.error("Error wrong password ")

          return res.status(200).json({ status: "Error", error: "wrong password", code: status_code.CODE_ERROR.INCORRECT_PASSWORD });
        }
        else {

          let myCredBasic = await services.credential.removeCredential(user.id, 'basic-auth')
          myCredBasic = await services.credential.getCredential(user.id, 'basic-auth')
          console.log("myCredBasic", myCredBasic)
          const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
            autoGeneratePassword: false,
            password: new_password,
            scopes: []
          })
          log4j.loggerinfo.info("Success.");
          console.log("crd_basic", crd_basic)

          return res.status(200).json({ status: "Success", message: "Password has been successfully changed" });


        }



      } catch (err) {
        log4j.loggererror.error("Error: " + err.message)

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

    gatewayExpressApp.get('/stats', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // still incomplete


      try {

        //////////////////////////topup///////////////////////

        log4j.loggerinfo.info("Call wallet get stock topup: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`);
        const statTopup = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountWallet.data", statTopup)
        if (!statTopup.data) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var stockTopup = []
        if (statTopup.data.status == 'success') {
          stockTopup = statTopup.data.data
        }
        console.log("statTopup", statTopup.data)
        ////////////////////////////////////region////////////////////////////////////////
        log4j.loggerinfo.info("Call get users by region: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/getUserByRegion`);
        const statsRegion = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/getUserByRegion`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountWallet.data", statsRegion.data)
        if (!statsRegion.data) {
          return res.status("500").json("Error: error Call get users by region");
        }
        var arrayStatsRegion = []
        if (statsRegion.data.status == 'success') {
          arrayStatsRegion = statsRegion.data.data
        }
        console.log("amountTotalWallet", arrayStatsRegion)


        log4j.loggerinfo.info("Call paymee: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
        const amountPaymee = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountPaymee.data", amountPaymee.data)
        if (!amountPaymee.data) {
          res.status("500").json("Error: error server paymee");
        }

        log4j.loggerinfo.info("Call topnet: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
        const amountTopnet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        console.log("amountTopnet.data", amountTopnet.data)

        if (!amountTopnet.data) {
          res.status("500").json("Error: error server topnet");
        }

        log4j.loggerinfo.info("Call voucher: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
        const amountVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,
          {
            params: {
              yearB: req.query.yearB,
              dayB: req.query.dayB
            }
          }
        )
        console.log("amountVoucher.data", amountVoucher.data)

        if (!amountVoucher.data) {
          res.status("500").json("Error: error server voucher");
        }


        log4j.loggerinfo.info("Call poste: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
        const amountPosteRecharge = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`, {
          yearB: req.query.yearB,
          dayB: req.query.dayB
        })
        console.log("amountPosteRecharge.data", amountPosteRecharge.data)

        if (!amountPosteRecharge.data) {
          res.status("500").json("Error: error server poste recharge");
        }
        log4j.loggerinfo.info("Call poste: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
        const amountPostePayemnt = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        console.log("amountPostePayemnt", amountPostePayemnt)

        if (!amountPostePayemnt.data) {
          res.status("500").json("Error: error server poste payement");
        }
        console.log("amountPaymee", amountPaymee.data)
        console.log("amountPosteRecharge", amountPosteRecharge.data)
        console.log("amountPostePayemnt", amountPostePayemnt.data)
        console.log("amountTopnet", amountTopnet.data)
        console.log("amountVoucher", amountVoucher.data)


        let ca = amountPaymee.data.data.amount.Success + amountPosteRecharge.data.data.amount.Success + amountPostePayemnt.data.data.amount.Success + amountTopnet.data.data.amount.Success
        console.log("ca", ca)
        let nbT = amountPaymee.data.data.transaction.All + amountPosteRecharge.data.data.transaction.All + amountPostePayemnt.data.data.transaction.All + amountTopnet.data.data.transaction.All

        log4j.loggerinfo.info("Call stats by month endpoint api-management/admin/statsAllMonth: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
        const statsDataAllMonth = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`)
        // console.log("statsDataAllMonth",statsDataAllMonth)
        console.log("statsDataAllMonth.data", statsDataAllMonth.data)
        if (!statsDataAllMonth.data) {
          res.status("500").json("Error: error server stats all month");
        }

        log4j.loggerinfo.info("Call statsCommission endpoint api-management/wallet/stats-commission: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
        const statsDataCommission = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`)
        // console.log("statsDataCommission",statsDataCommission)
        console.log("statsDataCommission.data", statsDataCommission.data)
        if (!statsDataCommission.data) {
          res.status("500").json("Error: error server statsDataCommission ");
        }

        console.log("statTopup", statTopup.data)
        console.log("eeeeeefffff")

        console.log("statTopup", statTopup)
        console.log("statTopup.data", statTopup.data)
        console.log("statTopup.data.data", statTopup.data.data)


        return res.status(200).json({
          "Services": {
            "paymee": amountPaymee.data.data,
            "voucher": amountVoucher.data,
            "poste_recharge": amountPosteRecharge.data.data,
            "poste_payement": amountPostePayemnt.data.data,
            "topup_ooredoo": stockTopup,
            "topnet": amountTopnet.data.data
          },
          "CA": ca,
          "Nombre_transaction": nbT,
          "Stats_Commission": statsDataCommission.data.data,
          "Stats_by_month": statsDataAllMonth.data.data,
          "number_users_by_region": arrayStatsRegion

        });






      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error: ")
        return res.status(error.response.status).send(error.response.data);
      }

    });


    gatewayExpressApp.get('/stats/byUser', verifyTokenUser, async (req, res, next) => { // still incomplete


      try {
        console.log("------------------------")
        console.log("----------req.body.userId-------------- ", req.body.userId)
        req.query.userId = req.body.userId
        console.log("----------req.query.userId-------------- ", req.query.userId)

        console.log("------------------------")
        //////////////////////////topup///////////////////////

        log4j.loggerinfo.info("Call wallet get stock topup: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`);
        const statTopup = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/stats/`, {
          params: {
            id_pdv: req.query.userId,
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountWallet.data", statTopup)
        if (!statTopup.data) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var stockTopup = []
        if (statTopup.data.status == 'success') {
          stockTopup = statTopup.data.data
        }
        console.log("statTopup", statTopup)
        ////////////////////////
        const paramPaymee = {
          id_pdv: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB
        }
        console.log("paramPaymee", paramPaymee)
        log4j.loggerinfo.info("Call paymee: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
        const amountPaymee = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`, {
          params: paramPaymee
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("*************************************")
        console.log("amountPaymee.data", amountPaymee.data)
        console.log("*************************************")


        if (!amountPaymee.data) {
          res.status("500").json("Error: error server");
        }

        log4j.loggerinfo.info("Call topnet: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
        const amountTopnet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`, {

          params: {
            company_id: req.query.userId,
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        console.log("amountTopnet.data", amountTopnet.data)

        if (!amountTopnet.data) {
          res.status("500").json("Error: error server");
        }

        log4j.loggerinfo.info("Call voucher: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
        const amountVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,
          {
            params: {
              id_user: req.query.userId,
              yearB: req.query.yearB,
              dayB: req.query.dayB
            }
          })
        console.log("amountVoucher.data", amountVoucher.data)

        if (!amountVoucher.data) {
          res.status("500").json("Error: error server");
        }


        log4j.loggerinfo.info("Call poste: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
        const amountPosteRecharge = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`, {
          params: {
            company_id: req.query.userId,
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        console.log("amountPosteRecharge.data", amountPosteRecharge.data)

        if (!amountPosteRecharge.data) {
          res.status("500").json("Error: error server");
        }
        log4j.loggerinfo.info("Call poste: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
        const amountPostePayemnt = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`, {
          params: {
            company_id: req.query.userId,
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        console.log("amountPostePayemnt", amountPostePayemnt.data)

        if (!amountPostePayemnt.data) {
          res.status("500").json("Error: error server");
        }
        console.log("amountPaymee", amountPaymee.data)
        console.log("amountPosteRecharge", amountPosteRecharge.data)
        console.log("amountPostePayemnt", amountPostePayemnt.data)
        console.log("amountTopnet", amountTopnet.data)
        console.log("amountVoucher", amountVoucher.data)
        let ca = 0;
        // if (condition) {

        // }
        console.log("amountPaymee.data", amountPaymee.data)
        ca = amountPaymee.data.data.amount.Success + amountPosteRecharge.data.data.amount.Success + amountPostePayemnt.data.data.amount.Success + amountTopnet.data.data.amount.Success
        console.log("ca", ca)
        let nbT = amountPaymee.data.data.transaction.All + amountPosteRecharge.data.data.transaction.All + amountPostePayemnt.data.data.transaction.All + amountTopnet.data.data.transaction.All
        console.log("azerty",
          {
            userId: req.userId,
            query: req.query.userId,
            body: req.body.userId
          }
        )
        log4j.loggerinfo.info("Call stats by month endpoint api-management/admin/statsAllMonth: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
        const statsDataAllMonth = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`,
          {
            params: {
              userId: req.body.userId
            }
          }
        )
        // console.log("statsDataAllMonth",statsDataAllMonth)
        console.log("statsDataAllMonth.data", statsDataAllMonth.data)
        if (!statsDataAllMonth.data) {
          res.status("500").json("Error: error server");
        }

        log4j.loggerinfo.info("Call statsCommission endpoint api-management/wallet/stats-commission: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
        const statsDataCommission = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`,
          {
            params: {
              walletId: req.body.userId
            }
          })
        // console.log("statsDataCommission",statsDataCommission)
        console.log("statsDataCommission.data", statsDataCommission.data)
        if (!statsDataCommission.data) {
          res.status("500").json("Error: error server");
        }
        console.log("eeeeeefffff")

        console.log("statTopup", statTopup)
        console.log("statTopup.data", statTopup.data)
        console.log("statTopup.data.data", statTopup.data.data)




        return res.status(200).json({
          "Services": {
            "paymee": amountPaymee.data.data,
            "voucher": amountVoucher.data,
            "poste_recharge": amountPosteRecharge.data.data,
            "poste_payement": amountPostePayemnt.data.data,
            "topup_ooredoo": stockTopup,

            "topnet": amountTopnet.data.data
          },
          "CA": ca,
          "Nombre_transaction": nbT,
          "Stats_Commission": statsDataCommission.data.data,
          "Stats_by_month": statsDataAllMonth.data.data

        });






      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error: ")
        return res.status(error.response.status).send(error.response.data);
      }

    });

    gatewayExpressApp.get('/stock_wallet', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // still incomplete


      try {

        //////////////////////////Wallet///////////////////////

        log4j.loggerinfo.info("Call wallet get solde all: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`);
        const amountWallet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountWallet.data", amountWallet.data)
        if (!amountWallet.data) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var amountTotalWallet = 0
        if (amountWallet.data.status == 'success') {
          amountTotalWallet = amountWallet.data.data
        }
        console.log("amountTotalWallet", amountTotalWallet)

        //////////////////////////voucher///////////////////////

        log4j.loggerinfo.info("Call voucher get stock voucher: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`);
        const stockVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`, {
          params: {
            // status: "1100",
            // dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)

        console.log("amountWallet.data", stockVoucher.data)
        if (!stockVoucher) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var stockTotalVoucher = 0
        if (stockVoucher.data.status == 'success') {

          for (let index = 0; index < stockVoucher.data.data.length; index++) {
            const element = stockVoucher.data.data[index];
            for (let j = 0; j < element.facial.length; j++) {
              const elt = element.facial[j];
              stockTotalVoucher = elt.countAll + stockTotalVoucher

            }
          }

          // stockTotalVoucher = stockVoucher.data.data.totalPages
        }
        console.log("stockTotalVoucher", stockTotalVoucher)

        const responseST_W = {
          "totale_wallet": amountTotalWallet,
          "stock": stockTotalVoucher
        }

        return res.status(200).send(responseST_W);


      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error: ")
        return res.status(error.response.status).send(error.response.data);
      }

    });

    gatewayExpressApp.get('/registre', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // still incomplete


      try {

        //////////////////////////Wallet///////////////////////

        log4j.loggerinfo.info("Call wallet get solde all: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`);
        const amountWallet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`, {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)
        console.log("amountWallet.data", amountWallet.data)
        if (!amountWallet.data) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var amountTotalWallet = 0
        if (amountWallet.data.status == 'success') {
          amountTotalWallet = amountWallet.data.data
        }
        console.log("amountTotalWallet", amountTotalWallet)

        //////////////////////////voucher///////////////////////

        log4j.loggerinfo.info("Call voucher get stock voucher: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`);
        const stockVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`, {
          params: {
            // status: "1100",
            // dayB: req.query.dayB
          }
        })
        // console.log("amountPaymee",amountPaymee)

        console.log("amountWallet.data", stockVoucher.data)
        if (!stockVoucher) {
          return res.status("500").json("Error: Call wallet get solde all");
        }
        var stockTotalVoucher = 0
        if (stockVoucher.data.status == 'success') {

          for (let index = 0; index < stockVoucher.data.data.length; index++) {
            const element = stockVoucher.data.data[index];
            for (let j = 0; j < element.facial.length; j++) {
              const elt = element.facial[j];
              stockTotalVoucher = elt.countAll + stockTotalVoucher

            }
          }

          // stockTotalVoucher = stockVoucher.data.data.totalPages
        }
        console.log("stockTotalVoucher", stockTotalVoucher)

        const responseST_W = {
          "totale_wallet": amountTotalWallet,
          "stock": stockTotalVoucher
        }

        return res.status(200).send(responseST_W);


      } catch (error) {
        if (!error.response) {
          log4j.loggererror.error(error.message)
          return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error: ")
        return res.status(error.response.status).send(error.response.data);
      }

    });

  };
