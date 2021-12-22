/* eslint-disable no-undef */
const services = require('express-gateway/lib/services/');

const env = require('../../../config/env.config');
const user_service = require('../../../services/user/user.service');

useragent = require('express-useragent');
const device = require('express-device');

const cors = require('cors');

const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};
console.log('super-admin');

module.exports = async function(gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());


    myUserExist = await services.user.find(env.USERADMIN);


    const scopeExiste = await services.credential.existsScope('super_admin');
    if (!scopeExiste) { // create scope if not existe
        console.log('scopeExiste',scopeExiste);
        const insereScope = await services.credential.insertScopes(['super_admin']);
        console.log('insereScope',insereScope);
    }

    if (myUserExist == false) { // if superAdmin does not exist
      myUser = await user_service.insert.insert({
        isActive: true,
        confirmMail: true,
        profilCompleted: true,
        firstname: 'paypos',
        lastname: 'paypos',
        username: env.USERADMIN,
        email: env.EMAIL,
        phone: env.PHONE,
        role: 'ROLE_SUPER_ADMIN',
        team: true,
        redirectUri: 'https://www.khallasli.com',
      });

      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: env.PASSWORD,
        scopes: [],
      });

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', {scopes: ['super_admin']});
      console.log('super Admin has been created');
    } else {
      console.log('SuperAdmin already exist.');
    }
};
