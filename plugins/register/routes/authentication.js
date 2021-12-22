/* eslint-disable no-unused-vars */
/* eslint-disable brace-style */
/* eslint-disable guard-for-in */
const services = require('express-gateway/lib/services/');
const utils = require('express-gateway/lib/services/utils');
const mail = require('../../../services/emails/emailProvider');
const util = require('../helpers/utils');
const os = require('os');
const ipF = require('ip');
const publicIp = require('public-ip');
const useragent = require('express-useragent');
const device = require('express-device');
const MobileDetect = require('mobile-detect');
const logger = require('../../../config/Logger');
const env = require('../../../config/env.config');

const cors = require('cors');

const {
  getToken, getProfile, getServiceByUser, updateprofile,
} = require('../../Services/users');

const {
    getCategoryFromWalletWithCode, 
} = require('../../Services/wallet');
const status_code = require('../config');

const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../../doc/swagger.json');

const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
      windowMs: 2 * 60 * 1000, // 2 minutes
      max: 2, // limite chaque adresse IP à 100 requêtes par windowMs
      message: {
        status: 'Error',
        error: 'Tentatives de connexion trop nombreuse, veuillez réessayer dans 2 min'},
      headers: true,
      });
module.exports = function(gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: env.LIMIT, extended: true}));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  gatewayExpressApp.post('/api/login', async (req, res, next) => { // code=20 for agent created by admin
    console.log('req.body', req.body);
    console.log('/api/login');
    const {username, password} = req.body;
    const myUser = await services.user.find(username);
    console.log('myUser', myUser);
    if (myUser == false) {
      logger.info('Error username does not exist.');
      util.setError(200, 'username does not exist', status_code.CODE_ERROR.NOT_EXIST);
      return util.send(res);
    } else if (myUser.demand == '1') {
      logger.info('user is on pending. please wait for the administrator\'s agreement ');
      util.setError(200, 'user is on pending. please wait for the administrator\'s agreement', status_code.CODE_ERROR.USER_ON_PENDING);
      return util.send(res);
    } else if (myUser.demand == '2') {
      logger.info('user is refused by the administrator ');
      util.setError(200, 'user is refused by the administrator', status_code.CODE_ERROR.USER_REFUSED);
      return util.send(res);
    } else if (myUser.isActive == false) {
      logger.info('Error user is desactivated. please wait for the administrator\'s agreement ');
      util.setError(200, 'user is desactivated. please wait for the administrator\'s agreement', status_code.CODE_ERROR.USER_DESACTIVATE);
      return util.send(res);
    }
    else if (myUser.isBlocked == true) {
      logger.info('Your account is locked. You have exceeded the maximum number of login attempts. You may attempt to log in again after the verification of the administrator\'s ');
      util.setError(200, 'Your account is locked. You have exceeded the maximum number of login attempts. You may attempt to log in again after the verification of the administrator\'s ', status_code.CODE_ERROR.USER_DESACTIVATE);
      return util.send(res);
    }
    else if (myUser.loginAttempts == '-1') {
      logger.info('Your account is locked. You have exceeded the maximum number of login attempts. You may attempt to log in again after the verification of the administrator\'s ');
      util.setError(200, 'Your account is locked. You have exceeded the maximum number of login attempts. You may attempt to log in again after the verification of the administrator\'s ', status_code.CODE_ERROR.USER_DESACTIVATE);
      return util.send(res);
    }

    const myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth');
    console.log('myCredBasic ', myCredBasic);
    const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password);
    if (!passBooleanTrue) {
          // ////////////////////////
    const MAX_LOGIN_ATTEMPTS = 2;
    const LOCK_TIME = 2 * 60 * 60 * 1000; // (2MIN) 7 200 000
    // const DIFF = 36 * 1000 * 1000;  //(10MIN) 36 000 000// 1h
    const DIFF = 6 * 1000 * 1000; // (10MIN) 6 000 000// 
    // var seconds = new Date().getTime() / 1000;
    // console.log("seconds",seconds)
    const userFinded = await services.user.findByUsernameOrId(myUser.id);
    console.log('user', userFinded);
    console.log('Date.now()', Date.now());

    if (userFinded.loginAttempts == 0 || !userFinded.loginAttempts) { // First loginAttempts
    userFinded.loginAttempts = 1;
    userFinded.nextTry = Date.now() + DIFF; // DATE OF FIRST TENTATIVE + 10 MIN

    console.log('userFinded.loginAttempts', userFinded.loginAttempts);
    console.log('userFinded.nextTry', userFinded.nextTry);

    const userUpdated = await services.user.update(userFinded.id,{
      loginAttempts: userFinded.loginAttempts.toString(),
      nextTry: userFinded.nextTry.toString(),
    });
    } else if (userFinded.nextTry > Date.now() && parseInt(userFinded.loginAttempts) + 1 < MAX_LOGIN_ATTEMPTS && parseInt(userFinded.loginAttempts) != -1) { // nextTry as number of tentative in DIFF
    console.log('userparseInt(MAX_LOGIN_ATTEMPTS) - parseInt(userFinded.loginAttempts)Updated 2222222222222222',parseInt(MAX_LOGIN_ATTEMPTS) - parseInt(userFinded.loginAttempts));

      userFinded.loginAttempts = parseInt(userFinded.loginAttempts) + 1;
      console.log(`\nIncorrect entries! ${parseInt(MAX_LOGIN_ATTEMPTS) + 1 - parseInt(userFinded.loginAttempts)} Entries Remaining!`);

      const userUpdated = await services.user.update(userFinded.id,{
        loginAttempts: userFinded.loginAttempts.toString(),
      });
    } else if (userFinded.nextTry > Date.now() && parseInt(userFinded.loginAttempts) + 1 >= MAX_LOGIN_ATTEMPTS && parseInt(userFinded.loginAttempts) != -1) { // Account is locked (-1) /nextTry as time a blocked account
      userFinded.loginAttempts = -1;
      userFinded.nextTry = Date.now() + LOCK_TIME;
      // send mail
      mail.sendMailAccountBlocked('Your account has been blocked', userFinded.email, userFinded.username, userFinded.firstname, userFinded.lastname);
      mail.sendMailAccountBlocked('Your account has been blocked', 'payposkhallasli@gmail.com', userFinded.username, userFinded.firstname, userFinded.lastname);

      // desactivated account
     
      const userUpdated = await services.user.update(userFinded.id,{
        loginAttempts: userFinded.loginAttempts.toString(),
        nextTry: userFinded.nextTry.toString(),
        isBlocked: 'true',
      });

      const getProfiled = await getProfile(userFinded.id, res);
      console.log('getProfiled.data', getProfiled.data);
        if (getProfiled.data.status == 'success') {
          console.log('id profile', getProfiled.data.data.id);
          console.log('myUser.id', userFinded.id);
          const bodyProfile = {
            isBlocked: true,
          };
      // ///////////////////////////update profile/////////////////////////////////////////////////////
          const userProfile = await updateprofile(bodyProfile, getProfiled.data.data.id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).json({'Error': 'Problem in server'});
          }
          logger.info('The user has been blocked');
        } else {
          return res.status(200).json({message: 'Error in updating profile'});
        }

      // const myUserDesactivate = await services.user.deactivate(userFinded.id);
    }

    // else if (parseInt(userFinded.loginAttempts) == -1){
    //   util.setError(200, "Your account has been locked. You have exceeded the maximum number of login attempts. You may attempt to log in again after the verification of the administrator's ", status_code.CODE_ERROR.USER_DESACTIVATE);
    //   return util.send(res);
    // }

    // return res.status(200).json({ tt:"test" });

// //////////////////////////////////////////

      logger.error('Error Wrong password');
      util.setError(200, 'Wrong password', status_code.CODE_ERROR.INCORRECT_PASSWORD);
      return util.send(res);
    }
    let crd_oauth2 = await services.credential.getCredential(myUser.id, 'oauth2');
    if (crd_oauth2) {
      const scope = crd_oauth2.scopes;
      console.log('scope', scope);
      crd_oauth2 = await services.credential.removeCredential(crd_oauth2.id, 'oauth2');
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', {scopes: scope});
      const get_crd_oauth2 = await services.credential.getCredential(myUser.id, 'oauth2');

      console.log('crd_oauth2 ', crd_oauth2);
      console.log('get_crd_oauth2 ', get_crd_oauth2);

      // here should get the token and applique invoke before generating a new one
      let token;
      try {
        token = await getToken(username, password, crd_oauth2.id, crd_oauth2.secret, res);
      } catch (error) {
        logger.error(`Error :${ error.message}`);
        util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
        return util.send(res);
      }
      // ///////////////////////////Get user info by username //////////////////////////////////
      const user = await services.user.findByUsernameOrId(myUser.id);
      console.log('user', user);
      
// ///////////////////////////////////
      console.log('*****************************************');
      // ///////// Check if it is a visitor ////////////////////
      const userJsonVisistor = {
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
      };
      const roles = [];
      scope.forEach((element) => {
        element = `ROLE_${ element.toUpperCase()}`;
        roles.push(element);
      });
      console.log('roles', roles);
      if (roles[0] == 'ROLE_VISITOR') return res.status(token.status).json({token: token.data, role: roles, user: userJsonVisistor, categoryWalletId: null});
      if (roles[0] == 'ROLE_SUPER_ADMIN') return res.status(token.status).json({token: token.data, role: roles, user: userJsonVisistor, categoryWalletId: null});
      else {
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** ************************ */
        const md = new MobileDetect(req.headers['user-agent']);
        console.log('md', md);
        // console.log("m", m);
        const md1 = new MobileDetect(req.get('User-Agent'));
        res.locals.isMobile = md1.mobile();

        console.log('md.os(), md.os()', md.os());
        if (md.os() === 'iOS') {
          console.log('is ios');
        } else if (md.os() === 'AndroidOS') {
          console.log('is android');
        } else if (md.os() === 'AndroidOS') {
          console.log('is android');
        }

        const ip = (typeof req.headers['x-forwarded-for'] === 'string' &&
          req.headers['x-forwarded-for'].split(',').shift()) ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
        const addr = ipF.address();
        const publicIpAdd = await publicIp.v4();
 
        const source = req.headers['user-agent'];
        const ua = useragent.parse(source);
        const {isMobile} = ua;
        console.log('isMobile', isMobile);
        const userUpdated = await services.user.update(myUser.id, {
          ip: publicIpAdd,
          os: os.platform(),
          source: ua.source,
          last_login: new Date().toString(),
        });
        console.log('userUpdated', userUpdated);
        // /////////////////////
        const interfaces = os.networkInterfaces();
        const addresses = [];
        for (const k in interfaces) {
          for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address);
            }
          }
        }
        console.log('addresses', addresses);
        // //////////////////////////
        const serviceResult = await getServiceByUser(user.id, res);
        if (!serviceResult.data) {
          logger.error('Error Problem in server wallet ');
          util.setError(500, 'Internal Server wallet Error', status_code.CODE_ERROR.SERVER);
          return util.send(res);
        }
        let serviceData = [];
        if (serviceResult.data) {
        if (serviceResult.data.data) {
          if (serviceResult.data.data.items) {
            serviceData = serviceResult.data.data.items;
          }
        }
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////
        let data;
        try {
          data = await getProfile(myUser.id, res);
        } catch (error) {
          console.log('error', error); // // tkt
          if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
          }
          logger.error(`Error in getting profile: ${ error.response.data}`);
          util.setError(error.response.status, error.response.data.message, error.response.data.code);
          return util.send(res);
        }
        /** ******************************************************************************************** */
        let dataCategory;
        if (data.data) {
          if (data.data.data) {
            if (data.data.data.Company) {
              if (data.data.data.Company.Category) {
                const {code} = data.data.data.Company.Category;
                try {
                  dataCategory = await getCategoryFromWalletWithCode(code, res);
                } catch (error) {
                  console.log('error', error); // // tkt
                  if (!error.response) {
                    logger.error(error.message);
                    util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
                    return util.send(res);
                  }
                  logger.error(`Error in getting profile: ${ error.response.data}`);
                  util.setError(error.response.status, error.response.data.message, error.response.data.code);
                  return util.send(res);
                }
              }
            }
          }
        }
        /** ************************************************************************************ */
        const name = `complete_profile${ Date.now()}`;
        // userApp = await services.application.find(name)
        const myApp = await services.application.insert({
          name: `user_app${ Date.now()}`,
          ip: user.ip,
          source: user.source,
          os: user.os,
          latitude: user.latitude,
          longitude: user.longitude,
          city: user.city,
          country: user.country,
        }, myUser.id);

        const userApp = await services.application.find(name);
        console.log('userapp', userApp);
        console.log('myApp', myApp);

        const userJson = {
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
            country: user.country,
          },
        };
        if (token) {
          if (token.status == 200) {
            if (data.status == 200) {
              logger.info('Succes in getting token.');
              if (dataCategory) {
                if (dataCategory.data.data) {
                  return res.status(token.status).json({token: token.data, role: roles, user: userJson, profile: data.data.data, categoryWalletId: dataCategory.data.data.items[0], services: serviceData});
                }
              }
              return res.status(token.status).json({token: token.data, role: roles, user: userJson, profile: data.data.data, categoryWalletId: null, services: serviceData});
            }
          }
        } else {
          logger.error('Error in getting profile');
          util.setError(500, 'error', status_code.CODE_ERROR.SERVER);
          return util.send(res);
        }
        console.log('scope', scope);
        console.log('myUser', myUser);
        return res.status(token.status).json({token: token.data, role: roles, user: myUser, services: serviceData});
      }
    } else {
      util.setError(200, 'User has no role', status_code.CODE_ERROR.HAS_NO_ROLE);
      return util.send(res);
    }
  });

 gatewayExpressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
