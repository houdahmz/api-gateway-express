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
var corsOptions = {
  origin: "*"
};
module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

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
    // else if (myUser.demand == "1") {
    //   log4j.loggerinfo.info("user is on pending. please wait for the administrator's agreement ");
    //   util.setError(200, "user is on pending. please wait for the administrator's agreement", status_code.CODE_ERROR.USER_ON_PENDING);
    //   return util.send(res);
    // }
    // else if (myUser.demand == "2") {
    //   log4j.loggerinfo.info("user is refused by the administrator ");
    //   util.setError(200, "user is refused by the administrator", status_code.CODE_ERROR.USER_REFUSED);
    //   return util.send(res);
    // }
    // else if (myUser.isActive == false) {
    //   log4j.loggerinfo.info("Error user is desactivated. please wait for the administrator's agreement ");
    //   util.setError(200, "user is desactivated. please wait for the administrator's agreement", status_code.CODE_ERROR.USER_DESACTIVATE);
    //   return util.send(res);
    // }
    myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth')
    console.log("myCredBasic ", myCredBasic)
    const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password)
    if (!passBooleanTrue) {
      log4j.loggererror.error("Error Wrong password")
      util.setError(200, "Wrong password", status_code.CODE_ERROR.INCORRECT_PASSWORD);
      return util.send(res);
    }
    crd_oauth2 = await services.credential.getCredential(myUser.id, 'oauth2')
    if (crd_oauth2) {
      let scope = crd_oauth2.scopes;
      console.log("******************Scopeeeeeee******************")
      console.log("scope", scope)
      console.log("************************************")
      crd_oauth2 = await services.credential.removeCredential(crd_oauth2.id, 'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: scope })
      tt = await services.credential.getCredential(myUser.id, 'oauth2')

      console.log("crd_oauth2 ", crd_oauth2)
      console.log("tt ", tt)

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
};
