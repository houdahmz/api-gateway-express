/* eslint-disable no-unused-vars */
/* eslint-disable brace-style */
/* eslint-disable guard-for-in */
const services = require('express-gateway/lib/services/');
const util = require('../helpers/utils');
const mail = require('../../../services/emails/emailProvider');
const device = require('express-device');
const logger = require('../../../config/Logger');
const env = require('../../../config/env.config');
const utils = require('express-gateway/lib/services/utils');

const cors = require('cors');

const status_code = require('../config');
const {
    verifyJwt,
  } = require('../../Services/function');
const {
    addWallet, getCurrency, 
 } = require('../../Services/wallet');
   
const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};
const {
    verifyTokenSuperAdminOrAdmin,
  } = require('./middleware');
  const {
    getProfileByUsername, getProfile, updateprofile, updateDeleted, updateprofileConfirm,
  } = require('../../Services/users');
    
module.exports = function(gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({limit: '50mb', extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  gatewayExpressApp.patch('/activate/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // endpoint for activate (isActivate)
    const {code} = req.body; // code = 1 desactive , 0 active // id is a username
    console.log('code',code);
    if (code != 0 && code != 1) {
      logger.error('Set code 1 to desactivate or 0 to activate a user');
      util.setError(200, 'Set code 1 to desactivate or 0 to activate a user', status_code.CODE_ERROR.CODE_INCORRECT);
      return util.send(res);
    }
    let myUser = await services.user.findByUsernameOrId(req.params.id);
    console.log('myUser', myUser);
    if (myUser == false) {
      logger.error('The user does not exist.');
      return res.status(200).json({message: 'The user does not exist'});
    }
    
    // ////////////////////////////Get profile///////////////////////////////////
    const getProfiled = await getProfileByUsername(req.params.id, res);
    console.log('getProfile', getProfiled.data);
    if (getProfiled.data.status == 'success') {
      console.log('myUser.id', myUser.id);
      // ////////////////////////////Desactivate a user///////////////////////////////////
      if (code == 1) {
        myUser = await services.user.deactivate(myUser.id);
        if (myUser == true) {
          console.log('id', getProfiled.data.data.data[0].id);
          const updateBody = {
            isActive: false,
          };
          console.log('*************************************************************************************');
          console.log('getProfiled.data.data.data[0].id_user', getProfiled.data.data.data[0].id);
          console.log('*************************************************************************************');
          // ////////////////////////////Update the status of user///////////////////////////////////
          const userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
          }
              // ////////////////////////////update///////////////////////////////////
            const updateDeletedBody = {
              deleted: code,
              deleted_by: req.body.deletedBy,
            };
            const userUpdated = await updateDeleted(updateDeletedBody, getProfiled.data.data.data[0].id, res);
              if (!userUpdated.data) {
                logger.error('Error Problem in server ');
                return res.status(500).json({'Error': 'Problem in server'});
              }
          // //////////////////////////////////

          return res.status(200).json({message: 'The user has been desactivated'});
        }
      } else if (code == 0) {
      // ////////////////////////////Activate a user///////////////////////////////////

        // const userUpdated = await services.user.update(myUser.id,{
        //   loginAttempts: '0',
        // });

        myUser = await services.user.activate(myUser.id);
  
        if (myUser == true) {
          // ///////////////////
          console.log('id', getProfiled.data.data.data[0].id);
          const updateBody = {
            isActive: true,
          };
          console.log('*************************************************************************************');
          console.log('getProfiled.data.data.data[0].id_user', getProfiled.data.data.data[0].id);
          console.log('*************************************************************************************');
          // ////////////////////////////Update the status of user///////////////////////////////////
          const userProfile = await updateprofile(updateBody, getProfiled.data.data.data[0].id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
          }
                        // ////////////////////////////update///////////////////////////////////
                        const updateDeletedBody = {
                          deleted: code,
                          deleted_by: req.body.deletedBy,
                        };
                        const userUpdated = await updateDeleted(updateDeletedBody, getProfiled.data.data.data[0].id, res);
                          if (!userUpdated.data) {
                            logger.error('Error Problem in server ');
                            return res.status(500).json({'Error': 'Problem in server'});
                          }
                      // //////////////////////////////////
            
          console.log('userProfile.data', userProfile.data);
          return res.status(200).json({message: 'The user has been activated'});
        }
      }
      return res.status(200).json({message: 'The visitor has been refused'});
    } else {
      return res.status(200).json({message: getProfiled.data});
    }
  });

  gatewayExpressApp.patch('/block/:id', async (req, res, next) => { // endpoint for activate (isActivate)
    const {isBlocked} = req.body; 
    console.log('isBlocked',isBlocked);
    if (!isBlocked) {
      logger.error('isBlocked can not be empty');
      util.setError(200, 'isBlocked can not be empty', status_code.CODE_ERROR.EMPTY);
      return util.send(res);
    }
    const data_json = {
      'true': '-1',
      'false': '0',
    };
    const myUser = await services.user.findByUsernameOrId(req.params.id);
    console.log('myUser', myUser);
    if (myUser == false) {
      logger.error('The user does not exist.');
      return res.status(200).json({message: 'The user does not exist'});
    }
    // ////////////////////////////Get profile///////////////////////////////////
    const getProfiled = await getProfile(myUser.id, res);
    console.log('getProfiled.data', getProfiled.data);
      if (getProfiled.data.status == 'success') {
        console.log('id profile', getProfiled.data.data.id);
        console.log('myUser.id', myUser.id);
        const bodyProfile = {
          isBlocked: isBlocked,
        };
        console.log('data_json[isBlocked]',data_json[isBlocked]);
        console.log('isBlocked', isBlocked);

    const userUpdated = await services.user.update(myUser.id,{
          loginAttempts: data_json[isBlocked],
        });

    // ///////////////////////////update profile/////////////////////////////////////////////////////
        const userProfile = await updateprofile(bodyProfile, getProfiled.data.data.id, res);
        if (!userProfile.data) {
          logger.error('Error Problem in server ');
          return res.status(500).json({'Error': 'Problem in server'});
        }
        logger.info('The user has been updated');
        util.setSuccess(200, 'The user has been updated', status_code.CODE_SUCCESS.SUCCESS);
        return util.send(res);
      } else {
        return res.status(200).json({message: 'Error in updating profile'});
      }
  });

  gatewayExpressApp.patch('/update_role/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => {
    const {role} = req.body; // code = 10 desactive , 11 active // id is a username
    if (!role) {
      logger.error('role can not be empty.');
      return res.status(200).json({error: 'role can not be empty '});
    }
    // ////////////////////////////Get user///////////////////////////////////
    const myUser = await services.user.find(req.params.id);
    console.log('myUser', myUser);
    if (myUser == false) {
      logger.error('User does not exist');
      return res.status(200).json({status: 'error', message: 'The user does not exist'});
    } else {
      let myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2');
      console.log('old myCredOauth', myCredOauth);
      const scope = myCredOauth.scopes;
      console.log('old scope', scope);
      myCredOauth = await services.credential.removeCredential(myCredOauth.id, 'oauth2');
      const roles = [];
      roles[0] = role;
      const crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', {scopes: roles});
      console.log('crd_oauth2 ', crd_oauth2);
      myCredOauth = await services.credential.getCredential(myUser.id, 'oauth2');
      return res.status(200).json({status: 'success', message: 'The user has been updates', role: myCredOauth.scopes});
    }
  });

  gatewayExpressApp.patch('/accept/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // accept or refuser a visitor (means give a visitor a role as a user)
    // accept or refuse a pdv 
    const {code} = req.body; // code = 10 delete , 11 accept // id is a username
    console.log('Body in accepte endpint ', req.body);
    if (code != 0 && code != 1) {
      logger.error('Set code 1 to desactivate or 0 to activate a user');
      util.setError(200, 'Set code 1 to desactivate or 0 to activate a user', status_code.CODE_ERROR.CODE_INCORRECT);
      return util.send(res);
    }
    // ////////////////////////////Get user///////////////////////////////////
    const myUser = await services.user.find(req.params.id);
    console.log('myUser', myUser);
    if (myUser == false) {
      logger.error('User does not exist');
      return res.status(200).json({status: 'error', message: 'The user does not exist'});
    } else {
      // if (code == 1 && myUser.demand == '2') { // refuse demand
      //   logger.error('user already refused');
      //   return res.status(200).json({status: 'error', message: 'user already refused', code: status_code.CODE_ERROR.ALREADY_REFUSED});
      // }
      // if (code == 0 && myUser.demand == '3') {
      //   logger.error('user already accepted'); // demand is already accepted
      //   return res.status(200).json({status: 'error', message: 'user already accepted', code: status_code.CODE_ERROR.ALREADY_ACCEPTED});
      // }
      // ////////////////////////////Get profile///////////////////////////////////
      const getProfiled = await getProfile(myUser.id, res);
      console.log('getProfile', getProfiled.data);
      if (code == 1) { // refuse user
        if (getProfiled.data.status == 'success') {
          console.log('CompanyId', getProfiled.data.data.CompanyId);
          console.log('myUser.id', myUser.id);
          const user_res = await services.user.update(myUser.id, {demand: '2'});
          const updateBody = {
            demand: '2',
          };
          console.log('aaaa update', getProfiled.data.data.id);
          const userProfile = await updateprofile(updateBody, getProfiled.data.data.id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).json({'Error': 'Problem in server'});
          }
          logger.error('The user has been refused');
          return res.status(200).json({status: 'success', message: 'The user has been refused'});
        } else {
          return res.status(200).json({message: getProfiled.data});
        }
      } else if (code == 0) { // accept user
        const myUserUpdated = await services.user.activate(myUser.id);
        if (myUserUpdated == true) {
          const user_res = await services.user.update(myUser.id, {demand: '3'}); // test this
          const updateBody = {
            isActive: true,
            demand: '3',
          };
          console.log('aaaa update', getProfiled.data.data.id);
          const userProfile = await updateprofile(updateBody, getProfiled.data.data.id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).json({'Error': 'Problem in server'});
          }
          // //generate pswd/////////
          const randomPassword = Math.random().toString(36).slice(-8);
          console.log('randomPassword', randomPassword);
          let myCredBasic = await services.credential.removeCredential(myUser.id, 'basic-auth');
          myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth');
          console.log('myCredBasic', myCredBasic);
          const crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
            autoGeneratePassword: false,
            password: randomPassword,
            scopes: [],
          });
          // ///get currency///////////
          const dataCurrency = await getCurrency(res);
          console.log('dataCurrency', dataCurrency.data);
          if (!dataCurrency.data.data) {
            logger.error('Error Problem in server ');
            return res.status(500).json({'Error': 'Problem in server'});
          }
          const currencyId = dataCurrency.data.data.items[0].id;
          // ///add wallet///////////
          const companyId = getProfiled.data.data.CompanyId;
          console.log('companyId', companyId);
          const dataWallet = await addWallet({
            balance: '0',
            companyId: companyId,
            currencyId: currencyId,
            createdBy: req.body.createdBy,
          });
          console.log('req.body.createdBy', req.body.createdBy);

          if (dataWallet.data.status == 'error') {
            return res.status(dataWallet.status).json({status: dataWallet.data.status, message: dataWallet.data.message});
          }
          // ////////////////////////////Send mail///////////////////////////////////
          const {origin} = req.headers;
          console.log('req.headers.origin ', req.headers.origin);
          let url;
          if (origin) {
            url = origin;
          } else {
            url = `${env.baseURL}:${env.HTTP_PORT}`;
          }
          const change_password_uri = `${url}/change-password`;
          console.log('change_password_uri', change_password_uri);
          mail.sendMailAdminConfirmation('confirmationByAdmin', change_password_uri, myUser.email, myUser.firstname, myUser.lastname, myUser.username, randomPassword);
          return res.status(200).json({status: 'success', message: 'The user has been accepted'});
        } else {
          return res.status(200).json({status: 'Error', message: 'The user has not been accepted'});
        }
      }
    }
  });

  gatewayExpressApp.post('/registration-confirm', async (req, res, next) => {
    try {
      console.log('/registration-confirm');
      const {username, confirm_token} = req.query;
      const user = await services.user.findByUsernameOrId(username);
      console.log('***********************************');
      console.log('user', user);
      console.log('confirm_token', confirm_token);
      console.log('***********************************');
      console.debug('confirmation', user, req.query, confirm_token, username);
      if (user == false) { // username does not exist
        console.debug('wrong confirmation token');
        logger.error('wrong confirmation token');
        return res.status(200).json({error: 'wrong confirmation token'});
      };
      const myCredBasic = await services.credential.getCredential(user.id, 'basic-auth');
      console.log('myCredBasic', myCredBasic);
      let decoded;
      try {
        decoded = await verifyJwt(confirm_token);
        console.log('***********************************');
        console.log('decoded', decoded);
        console.log('***********************************');
        if (!decoded) {
          console.debug('wrong confirmation token');
          logger.error('wrong confirmation token');
          return res.status(200).json({error: 'wrong confirmation token'});
        } else {
          if (user.username != decoded.username) {
            console.debug('???wrong confirmation token');
            logger.error('???wrong confirmation token');
            return res.status(200).json({error: 'wrong confirmation token'});
          }
          const passBooleanTrue = await utils.compareSaltAndHashed(decoded.password, myCredBasic.password);
          if (!passBooleanTrue) {
            logger.error('???wrong confirmation token');
            return res.status(200).json({error: 'wrong confirmation token'});
          }
        }
      } catch (error) {
        console.log('***********************************');
        console.log('error', error);
        console.log('***********************************');
        logger.error(`Error in adding profile: ${ error.message}`);
        return res.status(400).json({error: error.message});
      }
      console.log('user_res');
      const user_res = await services.user.update(user.id, {confirmMail: 'true'}); // test this
      console.log('user_res', user_res);
      // ///////////////////////////
      const getProfiled = await getProfile(user.id, res);
      console.log('getProfile', getProfiled.data);
      if (getProfiled.data.data.length == 0) {
        return res.status(200).json({status: 'Error', message: 'profile does not existe with id_user', code: status_code.CODE_ERROR.NOT_EXIST});
      }
      // ////////////////////////////////////////
      const updateBody = {
        confirmMail: true,
      };
      // ///////////////////
      // updateBody.company.profilCompleted = true
      const userProfile = await updateprofileConfirm(updateBody, getProfiled.data.data.id, res);
      if (!userProfile.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      // /////////////////////////////////
      return res.status(200).json({etat: 'Success'});
    } catch (err) {
      logger.error(`Error : ${ err.message}`); // ici
      return res.status(422).json({error: err.message});
    }
  });
};
