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
  createAdminProfile, getProfileByPhone, getProfileByEmail, addWallet, getType, getTypeById, getToken, getProfileByUsername, updateprofileConfirm, getCategoryFromWalletWithCode, getProfile, getCurrency, creteProfile, updateprofile, getWallet, updateprofileByAdmin
} = require("../../Services/users");

// const bodyParser = require("body-parser");
const express = require('express');
const status_code = require("../config")

const bodyParser = require("body-parser");
var corsOptions = {
  origin: "*"
};
console.log("super-admin")

module.exports = async function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());


    myUserExist = await services.user.find(env.USERADMIN)
    // console.log("env.USERADMIN", env.USERADMIN)
    // console.log("env.PASSWORD", env.PASSWORD)
    // console.log("env.EMAIL", env.EMAIL)
    // console.log("env.PHONE", env.PHONE)

    let scopeExiste = await services.credential.existsScope("super_admin")
    if(!scopeExiste){ // create scope if not existe
        console.log("scopeExiste",scopeExiste)
        let insereScope = await services.credential.insertScopes(["super_admin"])
        console.log("insereScope",insereScope)
    }

    if (myUserExist == false) { //if superAdmin does not exist
      myUser = await user_service.insert.insert({
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

      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: env.PASSWORD,
        scopes: []
      })

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['super_admin'] })
      console.log("super Admin has been created")
    }
    else {
      console.log("SuperAdmin already exist.");
    }

};
