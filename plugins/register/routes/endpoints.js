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
const user_service = require('../../../services/user/user.service')

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
  getToken, getProfile, getServiceByUser
} = require("../../Services/users");

const {
    getCategoryFromWalletWithCode, 
} = require("../../Services/wallet");


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

  gatewayExpressApp.get('/search', async (req, res, next) => { 

    const {username, phone, email} = req.query
    var myUser = false; //false if exist & true if does not exist
    if(username) {
      myUser = await services.user.findByUsernameOrId(username)
      if(myUser) myUser = false;
      else myUser = true;
      console.log("myUser",myUser)
      
    }
    var findByEmail = false;
    if(email) {
      findByEmail = await user_service.findByEmail(email)
      if(findByEmail) findByEmail = false;
      else findByEmail = true;
      console.log("findByEmail",findByEmail)

    }
    var findByPhone = false;
    if(phone) {
      findByPhone = await user_service.findByPhone(phone)
      if(findByPhone) findByPhone = false;
      else findByPhone = true;
      console.log("findByPhone",findByPhone)
      
    }
    console.log("findByPhone & findByEmail",findByPhone & findByEmail & myUser)
    console.log("!findByPhone & !findByEmail & !myUser",!findByPhone & !findByEmail & !myUser)

    if(findByPhone & findByEmail & myUser) //1
    return res.status(200).json({ status: "success", exist: true , message:"Does not exist", code: status_code.CODE_ERROR.NOT_EXIST });
    else return res.status(200).json({ status: "success", exist: false, message:"Already exist", code: status_code.CODE_ERROR.ALREADY_EXIST });

  });


};
