/* eslint-disable no-unused-vars */
/* eslint-disable brace-style */
/* eslint-disable guard-for-in */
const services = require('express-gateway/lib/services/');
const utils = require('express-gateway/lib/services/utils');
const mail = require('../../../services/emails/emailProvider');
const device = require('express-device');
const MobileDetect = require('mobile-detect');
const logger = require('../../../config/Logger');
const user_service = require('../../../services/user/user.service');
const env = require('../../../config/env.config');

const cors = require('cors');
const {resetSchema} = require('../schemaValidation/register');

const status_code = require('../config');
const {
    createJwt, verifyJwt,
  } = require('../../Services/function');
const validate = require('../middleware/validation');
  
const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};
const {
    verifyToken,
  } = require('./middleware');
  
module.exports = function(gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: env.LIMIT, extended: true}));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  gatewayExpressApp.post('/forgot-password', async (req, res, next) => { 
    // /////////////////Email////////////////////////
    const {email} = req.body;
    if (!email) return res.status(400).json({status: 'Error', error: 'Email is required', code: status_code.CODE_ERROR.EMPTY});
    const user = await user_service.findByEmail(email);
    if (!user) return res.status(400).json({status: 'Error', error: 'User with this email does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
    // /////////////////Get username////////////////////////
    const {username} = user;
      console.debug('confirmation', user, username);
      if (user == false) { // username does not exist
        console.debug('Username does not exist');
        logger.error('Error Username does not exist: ');
        return res.status(200).json({status: 'Error', error: 'Username does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
      }
      const myUserJwt = await createJwt(username,'');
      // /////////////////Send mail////////////////////////
      const {origin} = req.headers;
      let url;

      if (origin) {
        url = origin;
      } else {
        url = `${env.baseURL}:${env.HTTP_PORT}`;
      }
      const confirm_uri = `${url}/reset-password?username=${ username }&` + `token=${ myUserJwt}`;
      mail.sendPasswordReset('Reset password', confirm_uri, user.email, user.firstname, user.lastname);
      logger.info(`Success check your email : ${ user.email}`);
      return res.status(201).json({etat: 'Success', message: `Check your email : ${ user.email } for username ${ username}`});
      /** ********************************* */
  });

  gatewayExpressApp.post('/reset-password', validate(resetSchema), async (req, res) => {
    try {
      console.log('/reset-password');
      const {username, token} = req.query;
      const {password, password_confirmation} = req.body;
      const user = await services.user.findByUsernameOrId(username);
      console.log('user', user);
      console.debug('confirmation', user, req.query, token, username);
      if (user == false) { // username does not exist
        console.debug('wrong confirmation token');
        logger.error('Error wrong confirmation token');
        return res.status(200).json({error: 'wrong confirmation token'});
      }
      const myCredBasicA = await services.credential.getCredential(user.id, 'basic-auth');
      console.log('myCredBasicA', myCredBasicA);
      let decoded;
      try {
        // /////////////////Verify token////////////////////////

        decoded = await verifyJwt(token);
        if (!decoded) {
          console.debug('wrong confirmation token');
          logger.error('Error wrong confirmation token');
          return res.status(403).json({status: 'Error', error: 'wrong confirmation token'});
        } else {
          if (user.username != decoded.username) {
            console.debug('wrong confirmation token');
            logger.error('Error wrong confirmation token');
            return res.status(403).json({status: 'Error', error: 'wrong confirmation token'});
          }
          if (password != password_confirmation) {
            logger.error('Error password does not much ');
            return res.status(200).json({status: 'Error', error: 'password does not much'});
          }
        }
      } catch (error) {
        console.log('error', error.message);
        logger.error(`Error ${ error.message}`);
        logger.error(error);

        return res.status(400).json({status: 'Error', error: error.message});
      }
      let myCredBasic = await services.credential.removeCredential(user.id, 'basic-auth');
      myCredBasic = await services.credential.getCredential(user.id, 'basic-auth');
      // /////////////////Insert new password////////////////////////
      const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: password,
        scopes: [],
      });
      myCredBasic = await services.credential.getCredential(user.id, 'basic-auth');
      console.log('myCredBasic', myCredBasic);
      const passBooleanTrue = await utils.compareSaltAndHashed(password, myCredBasic.password);
      if (!passBooleanTrue) {
        logger.error('Error wrong confirmation token ');
        return res.status(200).json({error: 'wrong confirmation token'});
      }
      logger.info('Success.Votre mot de passe a été réinitialisé');
      return res.status(200).json({etat: 'Success', message: 'Votre mot de passe a été réinitialisé'});
    } catch (err) {
      logger.error(`Error: ${ err.message}`);
      return res.status(422).json({error: err.message});
    }
  });

  gatewayExpressApp.post('/change-password', verifyToken, async (req, res) => {
    try {
      console.log('/change-password');
      console.log('req.body', req.body);
      const {old_password, new_password, userId} = req.body;
      if (!old_password) return res.status(400).json({status: 'Error', error: 'old_password is required', code: status_code.CODE_ERROR.REQUIRED});
      if (!new_password) return res.status(400).json({status: 'Error', error: 'new_password is required', code: status_code.CODE_ERROR.REQUIRED});
      const user = await services.user.findByUsernameOrId(userId);
      console.log('user', user);
      // console.debug('confirmation', user, req.query, token, username)
      if (user == false) { // username does not exist
        console.debug('wrong confirmation token');
        logger.error('Error wrong confirmation token');
        return res.status(200).json({status: 'Error', error: 'wrong confirmation token', code: status_code.CODE_ERROR.NOT_EXIST});
      }
      const myCredBasic = await services.credential.getCredential(user.id, 'basic-auth');
      console.log('myCredBasic', myCredBasic);
      const passBooleanTrue = await utils.compareSaltAndHashed(old_password, myCredBasic.password);
      if (!passBooleanTrue) {
        logger.error('Error wrong password ');
        return res.status(200).json({status: 'Error', error: 'wrong password', code: status_code.CODE_ERROR.INCORRECT_PASSWORD});
      } else {
        let myCredBasic = await services.credential.removeCredential(user.id, 'basic-auth');
        myCredBasic = await services.credential.getCredential(user.id, 'basic-auth');
        console.log('myCredBasic', myCredBasic);
        // /////////////////Update password////////////////////////
        const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: new_password,
          scopes: [],
        });
        logger.info('Success.');
        console.log('crd_basic', crd_basic);
        return res.status(200).json({status: 'Success', message: 'Password has been successfully changed'});
      }
    } catch (err) {
      logger.error(`Error: ${ err.message}`);
      logger.error(err);
      return res.status(422).json({error: err.message});
    }
  });
};
