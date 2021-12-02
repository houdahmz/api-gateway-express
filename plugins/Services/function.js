const services = require('express-gateway/lib/services/');
const utils = require('express-gateway/lib/services/utils');
const axios = require('axios');
const mail = require('../../services/emails/emailProvider');
const util = require('../register/helpers/utils');
const jwt = require('jsonwebtoken');
const env = require('../../config/env.config');
const expiresIn = 3.6 * 1000 * 1000; // in ms //equals to 1 hour 
const user_service = require('../../services/user/user.service');

const config = require('express-gateway/lib/config/');
const tokenService = services.token;
const authService = services.auth;
const log4j = require('../../config/configLog4js.js');
const os = require('os');
useragent = require('express-useragent');
const device = require('express-device');
exports.addUser = async (body, password,scopes) => {
    // ///////////////////////////create user//////////////////////////////////////////////////////
    const user = await user_service.insert(body);
    console.log('user', user);
    // ///////////////////////////create basic-auth credential for authentication//////////////////
    crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
      autoGeneratePassword: false,
      password: password,
      scopes: [],
    });
    console.log('crd_basic',crd_basic);
    // ///////////////////////////create basic-auth credential for authorization with scope////////
    crd_oauth2 = await services.credential.insertCredential(user.id, 'oauth2', {scopes: scopes});
    console.log('crd_oauth2',crd_oauth2);
    return user;
};    
exports.createJwt = async (username, password = null) => {
    console.log('password',password);
    let json = {
        username: username,
        password: password,
    };
    if (!password) json = {username: username};
    const myUserJwt = await jwt.sign(json, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: expiresIn,
        subject: `${env.JWT_SUBJECT}`,
        algorithm: `${env.ALGORITHM}`,
      });
      return myUserJwt;
}; 
exports.verifyJwt = async (token) => {
    return await jwt.verify(token, `${env.JWT_SECRET}`, {algorithms: ['HS256']});
}; 
exports.incrementLoginAttempts = async (lockUntil,loginAttempts) => {
        //     console.log("lock until",lockUntil)
        //     // if we have a previous lock that has expired, restart at 1
        //     var lockExpired = !!(lockUntil && lockUntil < Date.now());
        // console.log("lockExpired",lockExpired)
        //     if (lockExpired) {
        //         return {
        //             set: { loginAttempts: 1 },
        //             unset: { lockUntil: 1 }
        //         };
        //     }
        // // otherwise we're incrementing
        //     var updates = loginAttempts+1;
        //         // lock the account if we've reached max attempts and it's not locked already
        //     var needToLock = !!(loginAttempts + 1 >= config.login.maxAttempts && !isLocked);
        // console.log("needToLock",needToLock)
        // console.log("loginAttempts",loginAttempts)
        //     if (needToLock) {
        //         updates.set = { lockUntil: Date.now() + config.login.lockoutHours };
        //         console.log("config.login.lockoutHours",Date.now() + config.login.lockoutHours)
            // }
// console.log("lockUntil",this.lockUntil)
    // return updates;
}; 
