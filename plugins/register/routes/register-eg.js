/* eslint-disable max-lines-per-function */
const services = require('express-gateway/lib/services/');
const utils = require('express-gateway/lib/services/utils');
const axios = require('axios');
const mail = require('../../../services/emails/emailProvider');
const mailSimple = require('./mailer.config.js');
const util = require('../helpers/utils');
const env = require('../../../config/env.config');
const user_service = require('../../../services/user/user.service');

const validate = require('../middleware/validation');
const {schema, teamSchema, adminSchema, resetSchema} = require('../schemaValidation/register');
const {profileSchema} = require('../schemaValidation/profile');
const {schemaCompany} = require('../schemaValidation/company');

const log4j = require('../../../config/configLog4js.js');
const logger = require('../../../config/Logger');

const device = require('express-device');
const cors = require('cors');
const {
  createAdminProfile, getType, getTypeById, getProfileByUsername, updateprofileConfirm, getProfile, creteProfile, updateprofile, updateprofileByAdmin, updateDeleted,
} = require('../../Services/users');

const {
   addWallet, getCurrency, 
} = require('../../Services/wallet');

const {
  addUser, createJwt, verifyJwt,
} = require('../../Services/function');

const {
  verifyToken,verifyTokenSuperAdmin,verifyTokenSuperAdminOrAdmin,verifyTokenUser,verifyTokenCommercial
} = require('./middleware');

// const bodyParser = require("body-parser");
const status_code = require('../config');
const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};

module.exports = function(gatewayExpressApp) {
  gatewayExpressApp.use(bodyParser.json({limit: '50mb', extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  // ////////////////////////////////////////////////////////////////////////////////
  gatewayExpressApp.post('/register', [validate(schema),
validate(profileSchema),
validate(schemaCompany)], async (req, res, next) => { 
    try {
      const {firstname, username, lastname, email, phone} = req.body;
      const {image, patent, photo, pos, cin, commercial_register, city, zip_code, adresse, activity, canals, id_commercial} = req.body;
      let {fromWeb} = req.body;
      console.log('fromWeb',fromWeb);
      const findByUsername = await services.user.findByUsernameOrId(username);
      console.log('findByUsername---------------',findByUsername);
      if (findByUsername) {
        return res.status(200).json({status: 'Error', error: 'username already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
      }

      // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
      if (!email) {
        util.setError(200, 'email is required', status_code.CODE_ERROR.EMPTY);
        return util.send(res);
      }
      if (!phone) {
        util.setError(200, 'phone is required', status_code.CODE_ERROR.EMPTY);
        return util.send(res);
      }
      // /////////////////////////////Check email/phone unique or not/////////////////////////////////////////////////////////
      const findByEmail = await user_service.findByEmail(email);
      console.log('findByEmail---------------',findByEmail);
      if (findByEmail) {
        return res.status(200).json({status: 'Error', error: 'Email already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
      }

      const findByPhone = await user_service.findByPhone(phone);
      console.log('findByEmail---------------',findByPhone);
      if (findByPhone) {
        return res.status(200).json({status: 'Error', error: 'Phone already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
      }
      // ///////////////////////////generate random password/////////////////////////////////////////////////////
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);
      console.log('randomPassword', env.JWT_TIME);
      console.log('randomPassword', env.JWT_SUBJECT);
      console.log('randomPassword', env.ALGORITHM);

      const myUserJwt = await createJwt(username,randomPassword);
      console.log('myUserJwt aaaaa',myUserJwt);
      console.log('myUserJwt', `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`);
      // /////////////////////////////create user/////////////////////////////////////////////////////
      const bodyUser = {
          isActive: false,
          confirmMail: false,
          profilCompleted: true,
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          phone: phone,
          role: 'ROLE_USER',
          team: false,
          demand: '1',
  
          redirectUri: `${env.baseURL}`,
          confirm_token: '',
        };
        let myUser;
        try {
          myUser = await addUser(bodyUser,randomPassword,['user']);
          console.log('myUser',myUser);
        } catch (error) {
          // console.log("error",error)
        util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
        return util.send(res);
        }

      const dataType = await getType('10', res);
      if (!dataType.data.data) {
        logger.error('Error Problem in server ');
        util.setError(500, 'Internal Server Error', status_code.CODE_ERROR.SERVER);
        return util.send(res);
      }
      // /////////////////////////////create profile/////////////////////////////////////////////////////
      if (!fromWeb) fromWeb = false;
      const {origin} = req.headers;
      console.log('req.headers.origin ', req.headers.origin);
      if (origin == env.URL) fromWeb = true;
      console.log('fromWeb ici ',fromWeb);

      const body = {
        fromWeb: fromWeb,

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
        canals: canals,
        id_commercial: id_commercial,
      };
      const userProfile = await creteProfile(myUser, body, dataType, res);
      if (!userProfile.data) {
        logger.error('Error Problem in server ');
        util.setError(500, 'Internal Server Error', status_code.CODE_ERROR.SERVER);
        return util.send(res);
      }
      // console.log("aaaa", userProfile)
      if (userProfile.data.status == 'error') {
        logger.error(`Error in adding profile: ${ userProfile.data}`);
        util.setError(400, userProfile.data);
        return util.send(res);
      }
      // ///////////////////////////create application contains his login info(last_login/from which device/////////////////////////////////////////////////////
      const myProfile = await services.application.insert({
        name: `complete_profile${ myUser.id}`,
        redirectUri: `${env.baseURL}:5000/api/profile`,
      }, myUser.id);
      // ///////////////////////////Send mails/////////////////////////////////////////////////////
      let url;
      if (origin) {
        url = origin;
      } else {
        url = `${env.baseURL}:${env.HTTP_PORT}`;
      }
      const confirm_uri = `${url}/registration-confirm?username=${ username }&` + `confirm_token=${ myUserJwt}`;
      mail.sendMail('Confirmation of your registration', 'Veuillez cliquer sur lien pour confirmer votre mail \n ', confirm_uri, req.body.email, username, firstname, lastname, randomPassword);
      console.log('confirm_uri', confirm_uri);
      
      logger.info(`Success, mail has been sent to : ${ email}`);
      return res.status(201).json({etat: 'Success', message: `Check your email : ${ email}`});
    } catch (err) {
      logger.error(`Error :${ err.message}`);
      util.setError(422, err.message); // code
      return util.send(res);
    }
  });

  gatewayExpressApp.post('/pdv-by-commercial',verifyTokenCommercial, [validate(schema),
    validate(profileSchema),
    validate(schemaCompany)], async (req, res, next) => { 
        try {
          const {firstname, username, lastname, email, phone} = req.body;
          const {image, patent, photo, pos, cin, commercial_register, city, zip_code, adresse, activity, canals} = req.body;
          let {fromWeb} = req.body;
          console.log('fromWeb',fromWeb);
          const findByUsername = await services.user.findByUsernameOrId(username);
          console.log('findByUsername---------------',findByUsername);
          if (findByUsername) {
            return res.status(200).json({status: 'Error', error: 'username already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
          }
    
          // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
          if (!email) {
            util.setError(200, 'email is required', status_code.CODE_ERROR.EMPTY);
            return util.send(res);
          }
          if (!phone) {
            util.setError(200, 'phone is required', status_code.CODE_ERROR.EMPTY);
            return util.send(res);
          }
          // /////////////////////////////Check email/phone unique or not/////////////////////////////////////////////////////////
          const findByEmail = await user_service.findByEmail(email);
          console.log('findByEmail---------------',findByEmail);
          if (findByEmail) {
            return res.status(200).json({status: 'Error', error: 'Email already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
          }
    
          const findByPhone = await user_service.findByPhone(phone);
          console.log('findByEmail---------------',findByPhone);
          if (findByPhone) {
            return res.status(200).json({status: 'Error', error: 'Phone already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
          }
          // ///////////////////////////generate random password/////////////////////////////////////////////////////
          const randomPassword = Math.random().toString(36).slice(-8);
          console.log('randomPassword', randomPassword);
          console.log('randomPassword', env.JWT_TIME);
          console.log('randomPassword', env.JWT_SUBJECT);
          console.log('randomPassword', env.ALGORITHM);
    
          const myUserJwt = await createJwt(username,randomPassword);
          console.log('myUserJwt aaaaa',myUserJwt);
          console.log('myUserJwt', `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`);
          // /////////////////////////////create user/////////////////////////////////////////////////////
          const bodyUser = {
              isActive: false,
              confirmMail: false,
              profilCompleted: true,
              firstname: firstname,
              lastname: lastname,
              username: username,
              email: email,
              phone: phone,
              role: 'ROLE_USER',
              team: false,
              demand: '1',
      
              redirectUri: `${env.baseURL}`,
              confirm_token: '',
            };
            let myUser;
            try {
              myUser = await addUser(bodyUser,randomPassword,['user']);
              console.log('myUser',myUser);
            } catch (error) {
              // console.log("error",error)
            util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
            return util.send(res);
            }
    
          const dataType = await getType('10', res);
          if (!dataType.data.data) {
            logger.error('Error Problem in server ');
            util.setError(500, 'Internal Server Error', status_code.CODE_ERROR.SERVER);
            return util.send(res);
          }
          // /////////////////////////////create profile/////////////////////////////////////////////////////
          if (!fromWeb) fromWeb = false;
          const {origin} = req.headers;
          console.log('req.headers.origin ', req.headers.origin);
          if (origin == env.URL) fromWeb = true;
          console.log('fromWeb ici ',fromWeb);
          const id_commercial = req.body.created_by;
          const body = {
            fromWeb: fromWeb,
    
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
            canals: canals,
            id_commercial: id_commercial,
          };
          const userProfile = await creteProfile(myUser, body, dataType, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            util.setError(500, 'Internal Server Error', status_code.CODE_ERROR.SERVER);
            return util.send(res);
          }
          // console.log("aaaa", userProfile)
          if (userProfile.data.status == 'error') {
            logger.error(`Error in adding profile: ${ userProfile.data}`);
            util.setError(400, userProfile.data);
            return util.send(res);
          }
          // ///////////////////////////create application contains his login info(last_login/from which device/////////////////////////////////////////////////////
          const myProfile = await services.application.insert({
            name: `complete_profile${ myUser.id}`,
            redirectUri: `${env.baseURL}:5000/api/profile`,
          }, myUser.id);
          // ///////////////////////////Send mails/////////////////////////////////////////////////////
          let url;
          if (origin) {
            url = origin;
          } else {
            url = `${env.baseURL}:${env.HTTP_PORT}`;
          }
          const confirm_uri = `${url}/registration-confirm?username=${ username }&` + `confirm_token=${ myUserJwt}`;
          mail.sendMail('Confirmation of your registration', 'Veuillez cliquer sur lien pour confirmer votre mail \n ', confirm_uri, req.body.email, username, firstname, lastname, randomPassword);
          console.log('confirm_uri', confirm_uri);
          
          logger.info(`Success, mail has been sent to : ${ email}`);
          return res.status(201).json({etat: 'Success', message: `Check your email : ${ email}`});
        } catch (err) {
          logger.error(`Error :${ err.message}`);
          util.setError(422, err.message); // code
          return util.send(res);
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
  gatewayExpressApp.patch('/complete-profile/:id', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log('/api/complete-profile');
      if (!req.params.id) {
        console.log('*********************************', req.body);
        return res.status(200).json({error: 'Id can not be empty'});
      }
      const {image, patent, photo, cin, commercial_register, city, zip_code, adresse, activity, updated_by, id_commercial} = req.body;
      console.log('req.ody', req.body);
      req.body.company.profilCompleted = true;
      const userProfile = await updateprofileByAdmin(req.body, res);
      if (!userProfile.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      };
      const user_res = await services.user.update(req.params.id, {profilCompleted: 'true'}); // test this
      logger.info('Success');
      return res.status(200).json({etat: 'success', message: 'Wait for the admin to accept your profile ', data: userProfile.data});
    } catch (err) {
      logger.error('Error in adding profile');
      return res.status(422).json({error: err.message});
    }
  });

  gatewayExpressApp.post('/agent-register', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // incomplete {add send mail with url /change_password} 
    try {
      const {firstname, username, lastname, email, phone, idOwner} = req.body;
      console.log('/api/agent-register');

      console.log('req.headers.authorization', req.headers.authorization);
      
      const createAgentProfile = async (agentUser) => {
        try {
          logger.info('Call postProfile agent: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`);
          return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/company/profile-by-company`
            , {
              // /profile-by-company
              idOwner: idOwner,
              id_user: agentUser.id,
              first_name: agentUser.firstname,
              last_name: agentUser.lastname,
              phone: agentUser.phone,
              team: false,
              email: agentUser.email,
              isActive: true,
              created_by: agentUser.id,

            },
          );
        } catch (error) {
          if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
          }
          logger.error('Error in adding profile: ');
          const deleted = services.user.remove(agentUser.id);

          return res.status(error.response.status).send(error.response.data);
        }
      };
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);

      const bodyUser = {
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        team: false,
        redirectUri: `${env.baseURL}`,
      };
      let agentUser;
      try {
        agentUser = await addUser(bodyUser,randomPassword,['agent']);
        console.log('agentUser',agentUser);
      } catch (error) {
        // console.log("error",error)
      util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
      return util.send(res);
      }


      console.log('email', email);
      console.log('password', randomPassword);

      const userProfile = await createAgentProfile(agentUser);
      console.log('userProfile.data', userProfile.data);
      if (!userProfile.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      if (userProfile.data.status == 'error') {
        logger.error(`Error in adding profile: ${ userProfile.data}`);
        return res.status(200).json(userProfile.data);
      }
      mailSimple.send_email('Reset password', `Veuillez cliquer sur lien pour changer le mot de passe (password: ${ randomPassword } )`, req.body.email);
      return res.status(201).json({etat: 'Success', message: `We have sent an email to ${ agentUser.email } to set a new password`});
    } catch (err) {
      logger.error('Error in adding profile: ');
      return res.status(422).json({error: err.message});
    }
  });

  gatewayExpressApp.post('/team-register', validate(teamSchema), async (req, res, next) => { // incomplete {add send mail with url /change_password} 
    try {
      const {firstname, username, lastname, email, phone, type_userId, role} = req.body;
      // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
      if (!email) {
        return res.status(400).json({status: 'Error', error: 'email is required', code: status_code.CODE_ERROR.REQUIRED});
      }
      if (!phone) {
        return res.status(400).json({status: 'Error', error: 'phone is required', code: status_code.CODE_ERROR.REQUIRED});
      }
      if (!type_userId) {
        return res.status(400).json({status: 'Error', error: 'type_userId is required', code: status_code.CODE_ERROR.REQUIRED});
      }
      if (!role) {
        return res.status(400).json({status: 'Error', error: 'role is required', code: status_code.CODE_ERROR.REQUIRED});
      }

      // /////////////////////////////////Check email/phone unique or not/////////////////////////////////////////////////////
      const scope_all = await services.credential.getAllScopes();
      console.log('scope_all',scope_all);
      const scope_exist = await services.credential.existsScope(role);
      console.log('scope_exist',scope_exist);
      if (!scope_exist) {
        return res.status(400).json({status: 'Error', error: 'role does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
      }
      const findByEmail = await user_service.findByEmail(email);
      console.log('findByEmail---------------',findByEmail);
      if (findByEmail) {
        return res.status(200).json({status: 'Error', error: 'Email already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
      }

      const findByPhone = await user_service.findByPhone(phone);
      if (findByPhone) {
        return res.status(200).json({status: 'Error', error: 'Phone already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
      }
      // ///////////////////////////generate random password/////////////////////////////////////////////////////
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);
      const myUserJwt = await createJwt(username,randomPassword);
      console.log('myUserJwt', `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`);
      const dataType = await getTypeById(type_userId, res);
      console.log('dataType.data.data', dataType.data);
      if (!dataType.data.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      if (dataType.data.data.code == status_code.CODE_SUCCESS.LIST_EMPTY) {
        logger.error('Error Problem in server ');
        return res.status(200).send({status: 'Error', message: dataType.data.data.message, code: status_code.CODE_SUCCESS.LIST_EMPTY});
      }

      // const code = dataType.data.data.data.type
      const code = role;

      const type = dataType.data.data.data.id;
      const bodyUser = {
        isActive: true,
        confirmMail: false,
        profilCompleted: true,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        role: `${code.toUpperCase()}`,
        team: true,

        redirectUri: `${env.baseURL}`,
        confirm_token: myUserJwt,

      };
      // ///////////////////////////create user/////////////////////////////////////////////////////
      let myUser;
      try {
        myUser = await addUser(bodyUser,randomPassword,[code]);
        console.log('myUser',myUser);
      } catch (error) {
      util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
      return util.send(res);
      }

      const creteProfile = async (myUser) => {
        try {
          console.log('myUser',myUser);
          console.log('profile', {
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
            role: code.toUpperCase(),

          });
          logger.info('Call postProfile: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
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
            role: code.toUpperCase(),
          });
        } catch (error) {
          console.log('error',error);
          if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
          }
          logger.error(`Error in createProfile :${ error.response.data}`);

          const deleted = services.user.remove(myUser.id);

          return res.status(error.response.status).send(error.response.data);
        }
      };

      // ///////////////////////////create profile/////////////////////////////////////////////////////
      const userProfile = await creteProfile(myUser);
      console.log('userProfile.data', userProfile.data);
      if (!userProfile.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      if (userProfile.data.status == 'error') {
        logger.error(`Error  : ${ userProfile.data}`);
        return res.status(400).json(userProfile.data);
      }
      // ///////////////////////////create application contains his login info(last_login/from which device/////////////////////////////////////////////////////
      const myProfile = await services.application.insert({
        name: `complete_profile${ myUser.id}`,
        redirectUri: `${env.baseURL}:5000/api/profile`,
      }, myUser.id);
      // ///////////////////////////Send mails/////////////////////////////////////////////////////
      const {origin} = req.headers;
      console.log('req.headers.origin ', req.headers.origin);
      let url;
      if (origin) {
        url = origin;
      } else {
        url = `${env.baseURL}:${env.HTTP_PORT}`;
      }
      const confirm_uri = `${url}/registration-confirm?username=${ username }&` + `confirm_token=${ myUserJwt}`;
      mail.sendMail('Confirmation', 'Veuillez cliquer sur lien pour confirmer votre mail \n ', confirm_uri, req.body.email, username);
      const change_password_uri = `${url}/change-password`;
      mail.sendChangePassword('Change password', `Veuillez cliquer sur lien pour changer le mot de passe (password: ${ randomPassword } ) \n `, change_password_uri, req.body.email, username, randomPassword);
      console.log('confirm_uri', confirm_uri);
      console.log('change_password_uri', change_password_uri);

      logger.info(`Success, mail has been sent to : ${ email}`);
      return res.status(201).json({etat: 'Success', message: `Check your email : ${ email}`});
    } catch (err) {
      logger.error(`Error :${ err.message}`);
      return res.status(422).json({error: err.message});
    }
  });

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

        const userUpdated = await services.user.update(myUser.id,{
          loginAttempts: '0',
        });

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
  gatewayExpressApp.post('/admin-register', validate(adminSchema), verifyTokenSuperAdmin,async (req, res, next) => {
    try {
      console.log('/api/admin-register');
      const {firstname, username, lastname, email, phone} = req.body;
      const bodyUser = {
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        team: true,
        role: 'ROLE_ADMIN',
        confirmMail: false,
        profilCompleted: true,

        redirectUri: `${env.baseURL}`,
      };
      // //////////Generate a random password///////////////////////////////////////
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);
      // ////////////
      let myUser;
      try {
        myUser = await addUser(bodyUser,randomPassword,['admin']);
        console.log('myUser',myUser);
      } catch (error) {
      util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
      return util.send(res);
      }
      // ///////////////////
      const dataType = await getType('20', res);
      if (!dataType.data.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      // let userProfile;
      const userProfile = await createAdminProfile(myUser, dataType.data.data.id, res);
      if (!userProfile.data.data) {
        logger.error('Error Problem in server ');
        return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
      }
      console.log('userProfile', userProfile.response);
      if (userProfile.data.status == 'error') {
        logger.error(`Error in adding profile: ${ userProfile.data}`);
        return res.status(200).json(userProfile.data);
      }
      console.log('email', email);
      console.log('password', randomPassword);
      // ////////////////////////////Send mail///////////////////////////////////
      const {origin} = req.headers;
      let url;
      if (origin) {
        url = origin;
      } else {
        url = `${env.baseURL}:${env.HTTP_PORT}`;
      }
      const change_password_uri = `${url}/change-password`;
      mail.sendChangePassword('Change password', `Veuillez cliquer sur lien pour changer le mot de passe (password: ${ randomPassword } ) \n `, change_password_uri, req.body.email, username, randomPassword);
      logger.info(`Admin has been successfuly created, we have sent an email to ${ email } to set a new password`);
      return res.status(201).json({etat: 'Success', message: `Admin has been successfuly created, we have sent an email to ${ email } to set a new password`});
    } catch (err) {
      logger.error(`Error in adding profile: ${ err}`);
      return res.status(422).json({error: err.message});
    }
  });

  gatewayExpressApp.get('/resend-mail/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // resend mail of creation pdv by admin
    try {
      console.log('/resend-mail');
      const myUser = await services.user.findByUsernameOrId(req.params.id);
      console.log('myUser', myUser);
      if (myUser == false) {
        logger.error('User does not exist');
        return res.status(200).json({status: 'error', message: 'The user does not exist'});
      } else {
        const {origin} = req.headers;
        console.log('req.headers.origin ', req.headers.origin);
        let url;

        if (origin) {
          url = origin;
        } else {
          url = `${env.baseURL}:${env.HTTP_PORT}`;
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        console.log('randomPassword', randomPassword);
        let myCredBasic = await services.credential.removeCredential(myUser.id, 'basic-auth');
        console.log('myCredBasic',myCredBasic);
        myCredBasic = await services.credential.getCredential(myUser.id, 'basic-auth');
        const crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: randomPassword,
          scopes: [],
        });
        const change_password_uri = `${url}/change-password`;
        mail.sendMailFromAdmin(myUser.email, myUser.username, myUser.firstname, myUser.lastname, randomPassword, change_password_uri);
        return res.status(200).json({etat: 'Success', message: `Admin has been successfuly created, we have sent an email to ${ myUser.email } to set a new password`});
      }
    } catch (err) {
      logger.error(`Error resending mail: ${ err.message}`);
      return res.status(400).json({etat: 'error', error: err.message});
    }
  });


  gatewayExpressApp.post('/forgot-password', async (req, res, next) => { 
    // /////////////////Email////////////////////////
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({status: 'Error', error: 'Email is required', code: status_code.CODE_ERROR.EMPTY});
    }
    const user = await user_service.findByEmail(email);
    if (!user) {
      return res.status(400).json({status: 'Error', error: 'User with this email does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
    }
    console.log('user', user);
    // /////////////////Get username////////////////////////
    const {username} = user;
      console.log('username', username);
      console.log('user', user);
      console.debug('confirmation', user, username);
      if (user == false) { // username does not exist
        console.debug('Username does not exist');
        logger.error('Error Username does not exist: ');
        return res.status(200).json({status: 'Error', error: 'Username does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
      }
      const myUserJwt = await createJwt(username,'');
      console.log('aaa', myUserJwt);
      console.log('req.header Referer', req.header('Referer'));
      console.log('req.headers[\'referer\']', req.headers['referer']);
      console.log('req.header Referrer', req.get('Referrer'));
      console.log(' Referrer || Referer', req.headers.referrer || req.headers.referer,
      );
      // /////////////////Send mail////////////////////////
      const {origin} = req.headers;
      console.log('req.headers.origin ', req.headers.origin);
      let url;

      if (origin) {
        url = origin;
      } else {
        url = `${env.baseURL}:${env.HTTP_PORT}`;
      }
      const confirm_uri = `${url}/reset-password?username=${ username }&` + `token=${ myUserJwt}`;
      console.log('confirm_uri', confirm_uri);
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
      console.log('password', password);
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
        console.log('decoded', decoded);
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
      console.log('old_password', old_password);
      console.log('new_password', new_password);
      if (!old_password) {
        return res.status(400).json({status: 'Error', error: 'old_password is required', code: status_code.CODE_ERROR.REQUIRED});
      }
      if (!new_password) {
        return res.status(400).json({status: 'Error', error: 'new_password is required', code: status_code.CODE_ERROR.REQUIRED});
      }
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
      return res.status(422).json({error: err.message});
    }
  });

  gatewayExpressApp.get('/stats', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // still incomplete
    try {
      // ////////////////////////topup///////////////////////
      logger.info('Call wallet get stock topup: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`);
      const statTopup = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('amountWallet.data', statTopup);
      if (!statTopup.data) {
        return res.status('500').json('Error: Call wallet get solde all');
      }
      let stockTopup = [];
      if (statTopup.data.status == 'success') {
        stockTopup = statTopup.data.data;
      }
      console.log('statTopup', statTopup.data);
      // //////////////////////////////////region////////////////////////////////////////
      logger.info('Call get users by region: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/getUserByRegion`);
      const statsRegion = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/getUserByRegion`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('amountWallet.data', statsRegion.data);
      if (!statsRegion.data) {
        return res.status('500').json('Error: error Call get users by region');
      }
      let arrayStatsRegion = [];
      if (statsRegion.data.status == 'success') {
        arrayStatsRegion = statsRegion.data.data;
      }
      console.log('amountTotalWallet', arrayStatsRegion);
      logger.info('Call paymee: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
      const amountPaymee = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('amountPaymee.data', amountPaymee.data);
      if (!amountPaymee.data) {
        res.status('500').json('Error: error server paymee');
      }

      logger.info('Call topnet: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
      const amountTopnet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      console.log('amountTopnet.data', amountTopnet.data);

      if (!amountTopnet.data) {
        res.status('500').json('Error: error server topnet');
      }

      logger.info('Call voucher: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
      const amountVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,
        {
          params: {
            yearB: req.query.yearB,
            dayB: req.query.dayB,
          },
        },
      );
      console.log('amountVoucher.data', amountVoucher.data);

      if (!amountVoucher.data) {
        res.status('500').json('Error: error server voucher');
      }


      logger.info('Call poste: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
      const amountPosteRecharge = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`, {
        yearB: req.query.yearB,
        dayB: req.query.dayB,
      });
      console.log('amountPosteRecharge.data', amountPosteRecharge.data);

      if (!amountPosteRecharge.data) {
        res.status('500').json('Error: error server poste recharge');
      }
      logger.info('Call poste: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
      const amountPostePayemnt = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      console.log('amountPostePayemnt', amountPostePayemnt);

      if (!amountPostePayemnt.data) {
        res.status('500').json('Error: error server poste payement');
      }
      console.log('amountPaymee', amountPaymee.data);
      console.log('amountPosteRecharge', amountPosteRecharge.data);
      console.log('amountPostePayemnt', amountPostePayemnt.data);
      console.log('amountTopnet', amountTopnet.data);
      console.log('amountVoucher', amountVoucher.data);


      const ca = amountPaymee.data.data.amount.Success + amountPosteRecharge.data.data.amount.Success + amountPostePayemnt.data.data.amount.Success + amountTopnet.data.data.amount.Success;
      console.log('ca', ca);
      const nbT = amountPaymee.data.data.transaction.All + amountPosteRecharge.data.data.transaction.All + amountPostePayemnt.data.data.transaction.All + amountTopnet.data.data.transaction.All;

      logger.info('Call stats by month endpoint api-management/admin/statsAllMonth: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
      const statsDataAllMonth = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
      // console.log("statsDataAllMonth",statsDataAllMonth)
      console.log('statsDataAllMonth.data', statsDataAllMonth.data);
      if (!statsDataAllMonth.data) {
        res.status('500').json('Error: error server stats all month');
      }

      logger.info('Call statsCommission endpoint api-management/wallet/stats-commission: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
      const statsDataCommission = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
      // console.log("statsDataCommission",statsDataCommission)
      console.log('statsDataCommission.data', statsDataCommission.data);
      if (!statsDataCommission.data) {
        res.status('500').json('Error: error server statsDataCommission ');
      }

      console.log('statTopup', statTopup.data);
      console.log('eeeeeefffff');
      console.log('statTopup', statTopup);
      console.log('statTopup.data', statTopup.data);
      console.log('statTopup.data.data', statTopup.data.data);

      return res.status(200).json({
        'Services': {
          'paymee': amountPaymee.data.data,
          'voucher': amountVoucher.data,
          'poste_recharge': amountPosteRecharge.data.data,
          'poste_payement': amountPostePayemnt.data.data,
          'topup_ooredoo': stockTopup,
          'topnet': amountTopnet.data.data,
        },
        'CA': ca,
        'Nombre_transaction': nbT,
        'Stats_Commission': statsDataCommission.data.data,
        'Stats_by_month': statsDataAllMonth.data.data,
        'number_users_by_region': arrayStatsRegion,

      });
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error: ');
      return res.status(error.response.status).send(error.response.data);
    }
  });


  gatewayExpressApp.get('/stats/byUser', verifyTokenUser, async (req, res, next) => { // still incomplete
    try {
      console.log('------------------------');
      console.log('----------req.body.userId-------------- ', req.body.userId);
      req.query.userId = req.body.userId;
      console.log('----------req.query.userId-------------- ', req.query.userId);
      console.log('------------------------');
      // ////////////////////////topup///////////////////////

      logger.info('Call wallet get stock topup: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/transaction/stats/`);
      const statTopup = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topUpKh/stats/`, {
        params: {
          id_pdv: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('amountWallet.data', statTopup);
      if (!statTopup.data) {
        return res.status('500').json('Error: Call wallet get solde all');
      }
      let stockTopup = [];
      if (statTopup.data.status == 'success') {
        stockTopup = statTopup.data.data;
      }
      console.log('statTopup', statTopup);
      // //////////////////////
      const paramPaymee = {
        id_pdv: req.query.userId,
        yearB: req.query.yearB,
        dayB: req.query.dayB,
      };
      console.log('paramPaymee', paramPaymee);
      logger.info('Call paymee: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`);
      const amountPaymee = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/paymee/stats`, {
        params: paramPaymee,
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('*************************************');
      console.log('amountPaymee.data', amountPaymee.data);
      console.log('*************************************');


      if (!amountPaymee.data) {
        res.status('500').json('Error: error server');
      }

      logger.info('Call topnet: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`);
      const amountTopnet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/topnet/stats`, {

        params: {
          company_id: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      console.log('amountTopnet.data', amountTopnet.data);

      if (!amountTopnet.data) {
        res.status('500').json('Error: error server');
      }

      logger.info('Call voucher: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`);
      const amountVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/stats`,
        {
          params: {
            id_user: req.query.userId,
            yearB: req.query.yearB,
            dayB: req.query.dayB,
          },
        });
      console.log('amountVoucher.data', amountVoucher.data);

      if (!amountVoucher.data) {
        res.status('500').json('Error: error server');
      }


      logger.info('Call poste: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`);
      const amountPosteRecharge = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-recharge`, {
        params: {
          company_id: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      console.log('amountPosteRecharge.data', amountPosteRecharge.data);

      if (!amountPosteRecharge.data) {
        res.status('500').json('Error: error server');
      }
      logger.info('Call poste: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`);
      const amountPostePayemnt = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/poste/stats-payement`, {
        params: {
          company_id: req.query.userId,
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      console.log('amountPostePayemnt', amountPostePayemnt.data);

      if (!amountPostePayemnt.data) {
        res.status('500').json('Error: error server');
      }
      console.log('amountPaymee', amountPaymee.data);
      console.log('amountPosteRecharge', amountPosteRecharge.data);
      console.log('amountPostePayemnt', amountPostePayemnt.data);
      console.log('amountTopnet', amountTopnet.data);
      console.log('amountVoucher', amountVoucher.data);
      let ca = 0;
      // if (condition) {

      // }
      console.log('amountPaymee.data', amountPaymee.data);
      ca = amountPaymee.data.data.amount.Success + amountPosteRecharge.data.data.amount.Success + amountPostePayemnt.data.data.amount.Success + amountTopnet.data.data.amount.Success;
      console.log('ca', ca);
      const nbT = amountPaymee.data.data.transaction.All + amountPosteRecharge.data.data.transaction.All + amountPostePayemnt.data.data.transaction.All + amountTopnet.data.data.transaction.All;
      console.log('azerty',
        {
          userId: req.userId,
          query: req.query.userId,
          body: req.body.userId,
        },
      );
      logger.info('Call stats by month endpoint api-management/admin/statsAllMonth: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`);
      const statsDataAllMonth = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/statsAllMonth`,
        {
          params: {
            userId: req.body.userId,
          },
        },
      );
      // console.log("statsDataAllMonth",statsDataAllMonth)
      console.log('statsDataAllMonth.data', statsDataAllMonth.data);
      if (!statsDataAllMonth.data) {
        res.status('500').json('Error: error server');
      }

      logger.info('Call statsCommission endpoint api-management/wallet/stats-commission: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`);
      const statsDataCommission = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/stats-commission`,
        {
          params: {
            walletId: req.body.userId,
          },
        });
      // console.log("statsDataCommission",statsDataCommission)
      console.log('statsDataCommission.data', statsDataCommission.data);
      if (!statsDataCommission.data) {
        res.status('500').json('Error: error server');
      }
      console.log('eeeeeefffff');

      console.log('statTopup', statTopup);
      console.log('statTopup.data', statTopup.data);
      console.log('statTopup.data.data', statTopup.data.data);

      return res.status(200).json({
        'Services': {
          'paymee': amountPaymee.data.data,
          'voucher': amountVoucher.data,
          'poste_recharge': amountPosteRecharge.data.data,
          'poste_payement': amountPostePayemnt.data.data,
          'topup_ooredoo': stockTopup,

          'topnet': amountTopnet.data.data,
        },
        'CA': ca,
        'Nombre_transaction': nbT,
        'Stats_Commission': statsDataCommission.data.data,
        'Stats_by_month': statsDataAllMonth.data.data,

      });
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error: ');
      return res.status(error.response.status).send(error.response.data);
    }
  });

  gatewayExpressApp.get('/stock_wallet', verifyTokenSuperAdminOrAdmin, async (req, res, next) => { // still incomplete
    try {
      // ////////////////////////Wallet///////////////////////

      logger.info('Call wallet get solde all: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`);
      const amountWallet = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/solde`, {
        params: {
          yearB: req.query.yearB,
          dayB: req.query.dayB,
        },
      });
      // console.log("amountPaymee",amountPaymee)
      console.log('amountWallet.data', amountWallet.data);
      if (!amountWallet.data) {
        return res.status('500').json('Error: Call wallet get solde all');
      }
      let amountTotalWallet = 0;
      if (amountWallet.data.status == 'success') {
        amountTotalWallet = amountWallet.data.data;
      }
      console.log('amountTotalWallet', amountTotalWallet);

      // ////////////////////////voucher///////////////////////

      logger.info('Call voucher get stock voucher: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`);
      const stockVoucher = await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/voucher/getStock`, {
        params: {
          // status: "1100",
          // dayB: req.query.dayB
        },
      });
      // console.log("amountPaymee",amountPaymee)

      console.log('amountWallet.data', stockVoucher.data);
      if (!stockVoucher) {
        return res.status('500').json('Error: Call wallet get solde all');
      }
      let stockTotalVoucher = 0;
      if (stockVoucher.data.status == 'success') {
        for (let index = 0; index < stockVoucher.data.data.length; index++) {
          const element = stockVoucher.data.data[index];
          for (let j = 0; j < element.facial.length; j++) {
            const elt = element.facial[j];
            stockTotalVoucher = elt.countAll + stockTotalVoucher;
          }
        }

        // stockTotalVoucher = stockVoucher.data.data.totalPages
      }
      console.log('stockTotalVoucher', stockTotalVoucher);

      const responseST_W = {
        'totale_wallet': amountTotalWallet,
        'stock': stockTotalVoucher,
      };

      return res.status(200).send(responseST_W);
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error: ');
      return res.status(error.response.status).send(error.response.data);
    }
  });
  gatewayExpressApp.post('/user', async (req, res) => { // without profile
    try {
      console.log('/add-user');
      console.log('req.body', req.body);
      const {username, email, phone} = req.body.user;
      const {scopes} = req.body;
      console.log('req.body',req.body);
            // ///////////////////////////Check existance of email/phone/username/////////////////////////////////////////////////////
            if (!username) {
              util.setError(400, 'username is required', status_code.CODE_ERROR.EMPTY);
              return util.send(res);
            }
            if (!email) {
              util.setError(400, 'email is required', status_code.CODE_ERROR.EMPTY);
              return util.send(res);
            }
            if (!phone) {
              util.setError(400, 'phone is required', status_code.CODE_ERROR.EMPTY);
              return util.send(res);
            }
            // /////////////////////////////Check email/phone unique or not/////////////////////////////////////////////////////////
            const findByEmail = await user_service.findByEmail(email);
            console.log('findByEmail---------------',findByEmail);
            if (findByEmail) {
              return res.status(200).json({status: 'Error', error: 'Email already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
            }
      
            const findByPhone = await user_service.findByPhone(phone);
            if (findByPhone) {
              return res.status(200).json({status: 'Error', error: 'Phone already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
            }
            const randomPassword = Math.random().toString(36).slice(-8);
            console.log('randomPassword', randomPassword);
      
            let myUser;
            try {
              myUser = await addUser(req.body.user,randomPassword,scopes);
              console.log('myUser',myUser);
            } catch (error) {
            util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
            return util.send(res);
            }
            logger.info('Success');
                const resp = {
                  data: myUser,
                  randomPassword: randomPassword,

                };
            return res.status(201).json({etat: 'Success', message: 'Successfully added' ,data: resp});
    } catch (err) {
      logger.error(`Error: ${ err.message}`);
      return res.status(422).json({error: err.message});
    }
  });
  // eslint-disable-next-line require-await
  gatewayExpressApp.get('/user', async (req, res) => { // without profile
    user_service.findAll(req.query).then((users) => res.json(users)).catch((err) => {
      return res.status(422).json({error: err.message});
    });
  });
};
