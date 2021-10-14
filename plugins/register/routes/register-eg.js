const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')
const axios = require('axios');
const mail = require("../../../services/emails/emailProvider");
const mailSimple = require("./mailer.config.js")

const util = require("../helpers/utils");

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
const {
  createAdminProfile, getProfileByPhone, getProfileByEmail, addWallet, getType, getTypeById, getToken, getProfileByUsername, updateprofileConfirm, getCategoryFromWalletWithCode, getProfile, getCurrency, creteProfile, updateprofile, getWallet, updateprofileByAdmin
} = require("./services");

// const bodyParser = require("body-parser");
const express = require('express');
const status_code = require("../config")

const bodyParser = require("body-parser");
const app = express();
var corsOptions = {
  origin: "*"
};

module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  //////////////////////////////////////////////////////////////////////////////////
  gatewayExpressApp.post('/register', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      const { firstname, username, lastname, email, phone, } = req.body
      const { image, patent, photo, pos, cin, commercial_register, city, zip_code, adresse, activity, updated_by, id_commercial } = req.body

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
        util.setError(400, "email is required", status_code.CODE_ERROR.EMPTY);
        return util.send(res);

      }
      if (!phone) {
        util.setError(400, "phone is required", status_code.CODE_ERROR.EMPTY);
        return util.send(res);

      }

      const getProfiled = await getProfileByEmail(email, res)
      console.log("getProfile", getProfiled.data)
      if (getProfiled.data.status == 'success') {
        console.log("getProfiled.data.data", getProfiled.data.data)
        if (getProfiled.data.data.data[0]) {
          util.setError(200, "Email already exist", status_code.CODE_ERROR.ALREADY_EXIST);
          return util.send(res);
        }
      } else {
        util.setError(200, getProfiled.data, status_code.CODE_ERROR.EMPTY); //code
        return util.send(res);
      }
      const getProfiledByPhone = await getProfileByPhone(phone, res)
      console.log("getProfiledByPhone", getProfiledByPhone.data)
      if (getProfiledByPhone.data.status == 'success') {
        console.log("getProfiledByPhone.data.data", getProfiledByPhone.data.data)
        if (getProfiledByPhone.data.data.data[0]) {
          util.setError(200, "Phone already exist", status_code.CODE_ERROR.ALREADY_EXIST);
          return util.send(res);
        }
      } else {
        util.setError(200, getProfiledByPhone.data, status_code.CODE_ERROR.EMPTY); //code
        return util.send(res);
      }
      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)
      console.log("randomPassword", env.JWT_TIME)
      console.log("randomPassword", env.JWT_SUBJECT)
      console.log("randomPassword", env.ALGORITHM)
      const myUserJwt = await jwt.sign({ username: username, password: randomPassword }, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: `18000`,
        subject: `${env.JWT_SUBJECT}`,
        algorithm: `${env.ALGORITHM}`
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
        demand: "1",

        redirectUri: 'https://www.khallasli.com',
        confirm_token: myUserJwt
      })
      console.log("myUser", myUser)
      const dataType = await getType("10", res);
      if (!dataType.data.data) {
        log4j.loggererror.error("Error Problem in server ")
        util.setError(500, "Internal Server Error", status_code.CODE_ERROR.SERVER);
        return util.send(res);
      }
      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: randomPassword,
        scopes: []
      })
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['user'] })
      // ****************************create_profile *********************************
      console.log("photooooooooooooooos", photo)
      const body = {
        image: image,
        patent: patent,
        photo: photo,
        cin: cin,
        pos: pos,
        commercial_register: commercial_register,
        city: city,
        zip_code: zip_code,
        adresse: adresse,
        activity: activity,
        id_commercial: id_commercial
      }
      const userProfile = await creteProfile(myUser, body, dataType, res);
      if (!userProfile.data) {
        log4j.loggererror.error("Error Problem in server ")
        util.setError(500, "Internal Server Error", status_code.CODE_ERROR.SERVER);
        return util.send(res);
      }
      // console.log("aaaa", userProfile)
      if (userProfile.data.status == "error") {
        // services.user.remove()
        log4j.loggererror.error("Error in adding profile: " + userProfile.data)
        //console.log("aaaa iciii ",myUser.id)
        util.setError(400, userProfile.data);
        return util.send(res);
      }
      myProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: `${env.baseURL}:5000/api/profile`
      }, myUser.id)

      var origin = req.headers.origin;
      console.log("req.headers.origin ", req.headers.origin)
      if (origin) {
        var url = origin
      } else {
        var url = `${env.baseURL}:${env.HTTP_PORT}`
      }
      const confirm_uri = `${url}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
      mail.sendMail("Confirmation of your registration", "Veuillez cliquer sur lien pour confirmer votre mail \n ", confirm_uri, req.body.email, username, firstname, lastname, randomPassword);
      console.log("confirm_uri", confirm_uri)
      log4j.loggerinfo.info("Success, mail has been sent to : " + email);
      return res.status(201).json({ etat: "Success", message: "Check your email : " + email });
    } catch (err) {
      log4j.loggererror.error("Error :" + err.message)
      util.setError(422, err.message); //code
      return util.send(res);
    }
  });

  gatewayExpressApp.post('/registration-confirm', async (req, res, next) => {
    try {
      console.log("/registration-confirm")
      const { username, confirm_token } = req.query
      const user = await services.user.findByUsernameOrId(username)
      console.log("***********************************")
      console.log("user", user)
      console.log("confirm_token", confirm_token)
      console.log("***********************************")
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
        log4j.loggererror.error("Error in adding profile: " + error.message)
        return res.status(400).json({ error: error.message });
      }
      console.log("user_res")
      user_res = await services.user.update(user.id, { confirmMail: 'true' }) //test this
      console.log("user_res", user_res)
      /////////////////////////////
      const getProfiled = await getProfile(user.id, res)
      console.log("getProfile", getProfiled.data)
      if (getProfiled.data.data.length == 0) {
        return res.status(200).json({ status: "Error", message: "profile does not existe with id_user", code: status_code.CODE_ERROR.NOT_EXIST });
      }
      //////////////////////////////////////////
      const updateBody = {
        confirmMail: true
      }
      /////////////////////
      // updateBody.company.profilCompleted = true
      let userProfile = await updateprofileConfirm(updateBody, getProfiled.data.data.id, res);
      if (!userProfile.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
      }
      ///////////////////////////////////
      return res.status(200).json({ etat: "Success" });
    } catch (err) {
      log4j.loggererror.error("Error : " + err.message) //ici
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
      console.log("req.ody", req.body)
      req.body.company.profilCompleted = true
      let userProfile = await updateprofileByAdmin(req.body, res);
      if (!userProfile.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });

      }
      user_res = await services.user.update(req.params.id, { profilCompleted: 'true' }) //test this
      log4j.loggerinfo.info("Success");
      return res.status(200).json({ etat: "success", message: "Wait for the admin to accept your profile ", data: userProfile.data });
    } catch (err) {
      log4j.loggererror.error("Error in adding profile: " + userProfile.data)
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.post('/agent-register', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // incomplete {add send mail with url /change_password} 
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
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });

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

  gatewayExpressApp.post('/team-register', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // incomplete {add send mail with url /change_password} 
    try {
      const { firstname, username, lastname, email, phone, type_userId } = req.body
      if (!email) {
        return res.status(400).json({ status: "Error", error: "email is required", code: status_code.CODE_ERROR.REQUIRED });
      }
      if (!phone) {
        return res.status(400).json({ status: "Error", error: "phone is required", code: status_code.CODE_ERROR.REQUIRED });
      }
      if (!type_userId) {
        return res.status(400).json({ status: "Error", error: "type_userId is required", code: status_code.CODE_ERROR.REQUIRED });
      }

      const getProfiled = await getProfileByEmail(email, res)
      console.log("getProfile", getProfiled.data)
      if (getProfiled.data.status == 'success') {
        console.log("getProfiled.data.data", getProfiled.data.data)
        if (getProfiled.data.data.data[0]) {
          return res.status(200).json({ status: "Error", error: "Email already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
        }

      } else {
        return res.status(200).json({ message: getProfiled.data });
      }
      const getProfiledByPhone = await getProfileByPhone(phone, res)
      console.log("getProfiledByPhone", getProfiledByPhone.data)
      if (getProfiledByPhone.data.status == 'success') {
        console.log("getProfiledByPhone.data.data", getProfiledByPhone.data.data)
        if (getProfiledByPhone.data.data.data[0]) {
          return res.status(200).json({ status: "Error", error: "Phone already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });
        }
      } else {
        return res.status(200).json({ message: getProfiledByPhone.data });
      }
      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)
      const myUserJwt = await jwt.sign({ username: username, password: randomPassword }, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: `18000`,
        subject: `${env.JWT_SUBJECT}`,
        algorithm: `${env.ALGORITHM}`
      });
      console.log("myUserJwt", `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`)
      const dataType = await getTypeById(type_userId, res);
      console.log("dataType.data.data", dataType.data.data.data)
      if (!dataType.data.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
      }
      const code = dataType.data.data.data.type
      const type = dataType.data.data.data.id
      myUser = await services.user.insert({
        isActive: true,
        confirmMail: false,
        profilCompleted: true,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        role: "ROLE_" + code.toUpperCase(),
        team: true,

        redirectUri: 'https://www.khallasli.com',
        confirm_token: myUserJwt
      })
      console.log("myUser", myUser)
      const creteProfile = async (myUser) => {
        try {
          console.log("aaacreteProfileaaa", {
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
            role: "ROLE_" + code.toUpperCase(),

          })
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
            role: "ROLE_" + code.toUpperCase(),
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
      console.log("crd_basic", crd_basic)
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: [code] })
      console.log("crd_oauth2", crd_oauth2)
      // ****************************create_profile *********************************
      const userProfile = await creteProfile(myUser);
      console.log("iciiiiiuserProfile", userProfile.data)
      if (!userProfile.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
      }
      if (userProfile.data.status == "error") {
        log4j.loggererror.error("Error  : " + userProfile.data)
        return res.status(400).json(userProfile.data);
      }
      // create 
      myProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: `${env.baseURL}:5000/api/profile`
      }, myUser.id)
      var origin = req.headers.origin;
      console.log("req.headers.origin ", req.headers.origin)
      if (origin) {
        var url = origin
      } else {
        var url = `${env.baseURL}:${env.HTTP_PORT}`
      }
      const confirm_uri = `${url}/registration-confirm?username=` + username + "&" + "confirm_token=" + myUserJwt;
      mail.sendMail("Confirmation", "Veuillez cliquer sur lien pour confirmer votre mail \n ", confirm_uri, req.body.email, username);
      const change_password_uri = `${url}/change-password`;
      mail.sendChangePassword("Change password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " ) \n ", change_password_uri, req.body.email, username, randomPassword);
      console.log("confirm_uri", confirm_uri)
      console.log("change_password_uri", change_password_uri)
      log4j.loggerinfo.info("Success, mail has been sent to : " + email);
      return res.status(201).json({ etat: "Success", message: "Check your email : " + email });
    } catch (err) {
      log4j.loggererror.error("Error :" + err.message)
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.patch('/activate/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { //endpoint pour activer
    const { code } = req.body // code = 10 desactive , 11 active // id is a username
    if (!code) {
      log4j.loggererror.error("Unkown error.")
      return res.status(200).json({ error: "Code can not be empty (set 10 to desactivate or 11 to activate a user" });
    }
    myUser = await services.user.findByUsernameOrId(req.params.id)
    console.log("myUser", myUser)
    if (myUser == false) {
      log4j.loggererror.error("Unkown error.")
      return res.status(200).json({ message: "The user does not exist" });
    }
    /************************************ */
    const getProfiled = await getProfileByUsername(req.params.id, res)
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
          let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id, res);
          if (!userProfile.data) {
            log4j.loggererror.error("Error Problem in server ")
            return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
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
          let userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id, res);
          if (!userProfile.data) {
            log4j.loggererror.error("Error Problem in server ")
            return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
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

  gatewayExpressApp.patch('/update_role/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => {
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
      return res.status(200).json({ status: "success", message: "The user has been updates", role: myCredOauth.scopes });
    }

  });

  gatewayExpressApp.patch('/accept/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { //accept or refuser a visitor (means give a visitor a role as a user)
    //accept or refuse a pdv 
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
      if (myUser.demand == "2") { //refuse demand
        log4j.loggererror.error("user already refused")
        return res.status(200).json({ status: "error", message: "user already refused", code: status_code.CODE_ERROR.ALREADY_REFUSED });
      }
      if (myUser.demand == "3") {
        log4j.loggererror.error("user already accepted") //demand is already accepted
        return res.status(200).json({ status: "error", message: "user already accepted", code: status_code.CODE_ERROR.ALREADY_ACCEPTED });
      }
      const getProfiled = await getProfile(myUser.id, res)
      console.log("getProfile", getProfiled.data)
      if (code == 10) { //refuse
        if (getProfiled.data.status == 'success') {
          console.log("CompanyId", getProfiled.data.data.CompanyId)
          console.log("myUser.id", myUser.id)
          user_res = await services.user.update(myUser.id, { demand: '2' })
          const updateBody = {
            demand: "2",
          }
          console.log("aaaa update", getProfiled.data.data.id)
          let userProfile = await updateprofile(updateBody, getProfiled.data.data.id, res);
          if (!userProfile.data) {
            log4j.loggererror.error("Error Problem in server ")
            return res.status(500).json({ "Error": "Problem in server" });
          }
          log4j.loggererror.error("The user has been refused")
          return res.status(200).json({ status: "success", message: "The user has been refused" });
        } else {
          return res.status(200).json({ message: getProfiled.data });
        }
      } else if (code == 11) { //accept user
        myUserUpdated = await services.user.activate(myUser.id)
        if (myUserUpdated == true) {
          user_res = await services.user.update(myUser.id, { demand: '3' }) //test this
          const updateBody = {
            isActive: true,
            demand: "3",
          }
          console.log("aaaa update", getProfiled.data.data.id)
          let userProfile = await updateprofile(updateBody, getProfiled.data.data.id, res);
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
          const dataCurrency = await getCurrency(res);
          console.log("dataCurrency", dataCurrency.data)
          if (!dataCurrency.data.data) {
            log4j.loggererror.error("Error Problem in server ")
            return res.status(500).json({ "Error": "Problem in server" });
          }
          const currencyId = dataCurrency.data.data.items[0].id
          /////add wallet///////////
          const companyId = getProfiled.data.data.CompanyId
          console.log("companyIdsssssssss", companyId)
          const dataWallet = await addWallet({
            balance: "0",
            companyId: companyId,
            currencyId: currencyId,
            createdBy: req.body.createdBy,
          });
          if (dataWallet.data.status == "error") {
            return res.status(dataWallet.status).json({ status: dataWallet.data.status, message: dataWallet.data.message });
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
          mail.sendMailAdminConfirmation("confirmationByAdmin", change_password_uri, myUser.email, myUser.firstname, myUser.lastname, myUser.username, randomPassword);
          return res.status(200).json({ status: "success", message: "The user has been accepted" });
        } else {
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
        role: "ROLE_ADMIN",
        confirmMail: false,
        profilCompleted: true,

        redirectUri: 'https://www.khallasli.com',
      })
      ////////////
      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)
      //////////////
      const dataType = await getType("20", res)
      if (!dataType.data.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
      }
      // let userProfile;
      let userProfile = await createAdminProfile(myUser, dataType.data.data.id, res)
      if (!userProfile.data.data) {
        log4j.loggererror.error("Error Problem in server ")
        return res.status(500).send({ status: "Error", error: "Internal Server Error", code: status_code.CODE_ERROR.SERVER });
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
      var origin = req.headers.origin;
      if (origin) {
        var url = origin
      } else {
        var url = `${env.baseURL}:${env.HTTP_PORT}`
      }
      const change_password_uri = `${url}/change-password`;
      mail.sendChangePassword("Change password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " ) \n ", change_password_uri, req.body.email, username, randomPassword);
      // mailSimple.send_email("Reset password", "Veuillez cliquer sur lien pour changer le mot de passe (password: " + randomPassword + " )", req.body.email);
      log4j.loggerinfo.info("Admin has been successfuly created, we have sent an email to " + email + " to set a new password");
      return res.status(201).json({ etat: "Success", message: "Admin has been successfuly created, we have sent an email to " + email + " to set a new password" });
    } catch (err) {
      log4j.loggererror.error("Error in adding profile: " + err)
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.get('/resend-mail/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { //resend mail of creation pdv by admin
    try {
      console.log("/resend-mail")
      myUser = await services.user.findByUsernameOrId(req.params.id)
      console.log("myUser", myUser)
      if (myUser == false) {
        log4j.loggererror.error("User does not exist")
        return res.status(200).json({ status: "error", message: "The user does not exist" });
      } else {
        var origin = req.headers.origin;
        console.log("req.headers.origin ", req.headers.origin)
        if (origin) {
          var url = origin
        } else {
          var url = `${env.baseURL}:${env.HTTP_PORT}`
        }
        var randomPassword = Math.random().toString(36).slice(-8);
        console.log("randomPassword", randomPassword)
        let myCredBasic = await services.credential.removeCredential(myUser.id, 'basic-auth')
        myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')
        const crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: randomPassword,
          scopes: []
        })
        const change_password_uri = `${url}/change-password`;
        mail.sendMailFromAdmin(myUser.email, myUser.username, myUser.firstname, myUser.lastname, randomPassword, change_password_uri)
        return res.status(200).json({ etat: "Success", message: "Admin has been successfuly created, we have sent an email to " + myUser.email + " to set a new password" });
      }
    } catch (err) {
      log4j.loggererror.error("Error resending mail: " + err.message)
      return res.status(400).json({ etat: "error", error: err.message })
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
    console.log("password", password)
    console.log("username", username)
    myUser = await services.user.find(username)
    console.log("myUser", myUser)
    if (myUser == false) {
      log4j.loggerinfo.info("Error username does not exist.");
      util.setError(200, "username does not exist", status_code.CODE_ERROR.NOT_EXIST);
      return util.send(res);
    }
    else if (myUser.demand == "1") {
      log4j.loggerinfo.info("user is on pending. please wait for the administrator's agreement ");
      util.setError(200, "user is on pending. please wait for the administrator's agreement", status_code.CODE_ERROR.USER_ON_PENDING);
      return util.send(res);
    }
    else if (myUser.demand == "2") {
      log4j.loggerinfo.info("user is refused by the administrator ");
      util.setError(200, "user is refused by the administrator", status_code.CODE_ERROR.USER_REFUSED);
      return util.send(res);
    }
    else if (myUser.isActive == false) {
      log4j.loggerinfo.info("Error user is desactivated. please wait for the administrator's agreement ");
      util.setError(200, "user is desactivated. please wait for the administrator's agreement", status_code.CODE_ERROR.USER_DESACTIVATE);
      return util.send(res);
    }
    myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')
    console.log("myCredBasic ", myCredBasic)
    const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password)
    if (!passBooleanTrue) {
      log4j.loggererror.error("Error Wrong password")
      util.setError(200, "Wrong password", status_code.CODE_ERROR.INCORRECT_PASSWORD);
      return util.send(res);
    }
    myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2')
    if (myCredOauth) {
      let scope = myCredOauth.scopes;
      console.log("******************Scopeeeeeee******************")
      console.log("scope", scope)
      console.log("************************************")
      myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: scope })
      console.log("crd_oauth2 ", crd_oauth2)
      // here should get the token and applique invoke before generating a new one
      let token;
      try {
        token = await getToken(username, password, crd_oauth2.id, crd_oauth2.secret, res)
      } catch (error) {
        log4j.loggererror.error("Error :" + error.message)
        util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
        return util.send(res);
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
        role: scope[0],

        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
      var roles = []
      scope.forEach(element => {
        element = "ROLE_" + element.toUpperCase()
        roles.push(element)
      });
      console.log("rolessss", roles)
      if (roles[0] == 'ROLE_VISITOR') {
        // return res.status(token.status).json({ token: token.data, role: "ROLE_"+scope.toUpperCase(), user: userJsonVisistor, categoryWalletId: null });
        return res.status(token.status).json({ token: token.data, role: roles, user: userJsonVisistor, categoryWalletId: null });
      }
      if (roles[0] == 'ROLE_SUPER_ADMIN') {
        // return res.status(token.status).json({ token: token.data, role: "ROLE_"+scope.toUpperCase(), user: userJsonVisistor, categoryWalletId: null });
        return res.status(token.status).json({ token: token.data, role: roles, user: userJsonVisistor, categoryWalletId: null });
      }
      // else
      // if(scope[0] == 'admin'){
      //   return res.status(token.status).json({ token: token.data, role: scope ,user: userJsonVisistor , categoryWalletId: null});
      // }
      else {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        var data;
        try {
          data = await getProfile(myUser.id, res)
        } catch (error) {
          console.log("error", error) //// tkt
          if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
          }
          log4j.loggererror.error("Error in getting profile: " + error.response.data)
          util.setError(error.response.status, error.response.data.message, error.response.data.code);
          return util.send(res);
        }
        /********************************************************************************************** */
        // console.log("data",data)
        console.log("*********************************")
        console.log("**************/////////////////////*******************")
        var dataCategory;
        if (data.data) {
          if (data.data.data) {
            if (data.data.data.Company) {
              if (data.data.data.Company.Category) {
                var code = data.data.data.Company.Category.code
                try {
                  dataCategory = await getCategoryFromWalletWithCode(code, res)
                } catch (error) {
                  console.log("error", error) //// tkt
                  if (!error.response) {
                    log4j.loggererror.error(error.message)
                    util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
                    return util.send(res);
                  }
                  log4j.loggererror.error("Error in getting profile: " + error.response.data)
                  util.setError(error.response.status, error.response.data.message, error.response.data.code);
                  return util.send(res);
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
                if (dataCategory.data.data) {
                  return res.status(token.status).json({ token: token.data, role: roles, user: userJson, profile: data.data.data, categoryWalletId: dataCategory.data.data.items[0] });
                }
              }
              return res.status(token.status).json({ token: token.data, role: roles, user: userJson, profile: data.data.data, categoryWalletId: null });
            }
          }
        }
        else {
          log4j.loggererror.error("Error in getting profile")
          util.setError(500, "error", status_code.CODE_ERROR.SERVER);
          return util.send(res);
        }
        log4j.loggerinfo.info("Getting token");
        console.log("token.status", token.status)
        console.log("token.data", token.data)
        console.log("scope", scope)
        console.log("myUser", myUser)
        return res.status(token.status).json({ token: token.data, role: roles, user: myUser });
      }
    }
    else {
      util.setError(200, "User has no role", status_code.CODE_ERROR.HAS_NO_ROLE);
      return util.send(res);
    }
  });

  gatewayExpressApp.get('/api/logout', async (req, res, next) => { // still incomplete
    console.log('heere', req.headers.authorization)
    const test = await services.token.getTokenObject(req.headers.authorization)

    return res.status(200).json(test);

  });

  gatewayExpressApp.post('/api/refreshToken', async (req, res, next) => { // still incomplete
    const { client_id, client_secret, refresh_token } = req.body
    console.log("************token *******************")

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
    const token = getRefreshToken(client_id, client_secret, refresh_token)
    console.log("token ", token.data)
    console.log("token.data.access_token ", token.data.access_token)
    console.log("token ", token)
    return res.status(200).json({ token: token.data });
    // myCredOauth = await services.credential.getCredential(client_id, 'oauth2')
    // myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2')
    // crd_oauth2 = await services.credential.insertCredential(client_id, 'oauth2')
    // console.log("crd_oauth2 ", crd_oauth2)
    // console.log("crd_oauth2 ", myCredOauth)
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
    const getProfiled = await getProfileByEmail(email)
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
        expiresIn: `18000`,
        subject: `${env.JWT_SUBJECT}`,
        algorithm: `${env.ALGORITHM}`
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
      if (origin) {
        var url = origin
      } else {
        var url = `${env.baseURL}:${env.HTTP_PORT}`
      }
      const confirm_uri = `${url}/reset-password?username=` + username + "&" + "token=" + myUserJwt;
      console.log("confirm_uri", confirm_uri)
      mail.sendPasswordReset("Reset password", confirm_uri, user.email, user.firstname, user.lastname)
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
        }
      } catch (error) {
        console.log("error", error.message)
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
      return res.status(200).json({ etat: "Success", message: "Votre mot de passe a été réinitialisé" });
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
      console.log("myCredBasicA", myCredBasicA)
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

  gatewayExpressApp.get('/run', async (req, res, next) => { // still incomplete
    myUserExist = await services.user.find(env.USERADMIN)
    console.log("env.USERADMIN", env.USERADMIN)
    console.log("env.PASSWORD", env.PASSWORD)
    console.log("env.EMAIL", env.EMAIL)
    console.log("env.PHONE", env.PHONE)

    if (myUserExist == false) { //if admin does not exist
      myUser = await services.user.insert({
        isActive: true,
        confirmMail: true,
        profilCompleted: true,
        firstname: "paypos",
        lastname: "paypos",
        username: env.USERADMIN,
        email: env.EMAIL,
        phone: env.PHONE,
        role: "ROLE_SUPER_ADMIN",
        team: true,
        redirectUri: 'https://www.khallasli.com',
      })
      console.log("Admin already exist.");

  // manque la creation de scope super_admin
      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: env.PASSWORD,
        scopes: []
      })
      console.log("Admin alfffready exist.");

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['super_admin'] })
      return res.status(200).send("super Admin has been created");

    }
    else {
      console.log("Admin already exist.");
      return res.status(200).send("super Admin already exist");
    }

  });


};
