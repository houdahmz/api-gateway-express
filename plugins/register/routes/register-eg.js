/* eslint-disable max-lines-per-function */
const services = require('express-gateway/lib/services/');
const axios = require('axios');
const mail = require('../../../services/emails/emailProvider');
const mailSimple = require('./mailer.config.js');
const util = require('../helpers/utils');
const env = require('../../../config/env.config');

const validate = require('../middleware/validation');
const {schema, teamSchema, adminSchema} = require('../schemaValidation/register');
const {profileSchema} = require('../schemaValidation/profile');
const {schemaCompany} = require('../schemaValidation/company');
const logger = require('../../../config/Logger');

const device = require('express-device');
const cors = require('cors');
const {
  createAdminProfile, getType, getTypeById, getProfile, creteProfile,
} = require('../../Services/users');

const {
  addUser, createJwt,
} = require('../../Services/function');

const {
  verifyTokenSuperAdmin,verifyTokenSuperAdminOrAdmin,verifyTokenCommercial,verifyBody,
} = require('./middleware');

// const bodyParser = require("body-parser");
const status_code = require('../config');
const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};

module.exports = function(gatewayExpressApp) {
  gatewayExpressApp.use(bodyParser.json({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: env.LIMIT, extended: true}));
  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

  // ////////////////////////////////////////////////////////////////////////////////
  gatewayExpressApp.post('/register',verifyBody, [validate(schema),
validate(profileSchema),
validate(schemaCompany)], async (req, res, next) => { 
    try {
      const {firstname, username, lastname, email, phone} = req.body;
      const {image, patent, photo, pos, cin, commercial_register, city, zip_code, adresse, activity, canals, location_x, location_y, imei, id_commercial} = req.body;
      let {fromWeb} = req.body;
      // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
      if (!email) {
        util.setError(200, 'email is required', status_code.CODE_ERROR.EMPTY);
        return util.send(res);
      }
      if (!phone) {
        util.setError(200, 'phone is required', status_code.CODE_ERROR.EMPTY);
        return util.send(res);
      }
      // ///////////////////////////generate random password/////////////////////////////////////////////////////
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);
      const myUserJwt = await createJwt(username,randomPassword);
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
          role: 'user',
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

        location_x: location_x,
        location_y: location_y,
        imei: imei,


      };
      console.log('body',body);

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
      util.setError(500, err.message); // code
      return util.send(res);
    }
  });

  gatewayExpressApp.post('/pdv-by-commercial',verifyTokenCommercial,verifyBody, [validate(schema),
    validate(profileSchema),
    validate(schemaCompany)], async (req, res, next) => { 
        try {
          const {firstname, username, lastname, email, phone} = req.body;
          const {image, patent, photo, pos, cin, commercial_register, city, zip_code, adresse, activity,location_x,location_y, imei, canals} = req.body;
          let {fromWeb} = req.body;
          // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
          if (!email) {
            util.setError(200, 'email is required', status_code.CODE_ERROR.EMPTY);
            return util.send(res);
          }
          if (!phone) {
            util.setError(200, 'phone is required', status_code.CODE_ERROR.EMPTY);
            return util.send(res);
          }
          // ///////////////////////////generate random password/////////////////////////////////////////////////////
          const randomPassword = Math.random().toString(36).slice(-8);
          console.log('randomPassword', randomPassword);
   
          const myUserJwt = await createJwt(username,randomPassword);
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
              role: 'user',
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
          fromWeb = false;
          const getProfileCommercial = await getProfile(req.body.created_by, res);


          const id_commercial = getProfileCommercial.data.data.id;
          console.log('id_commercial',id_commercial);
          console.log('req.body',req.body);


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
            location_x: location_x,
            location_y: location_y,
            imei: imei,
    
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

  gatewayExpressApp.post('/team-register',verifyBody,validate(teamSchema), async (req, res, next) => { // incomplete {add send mail with url /change_password} 
    try {
      const {firstname, username, lastname, email, phone, type_userId, role} = req.body;
      // ///////////////////////////Check existance of email/phone/typeId/////////////////////////////////////////////////////
      if (!username) {
        return res.status(400).json({status: 'Error', error: 'username is required', code: status_code.CODE_ERROR.REQUIRED});
      }
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
      // ///////////////////////////generate random password/////////////////////////////////////////////////////
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log('randomPassword', randomPassword);
      const myUserJwt = await createJwt(username,randomPassword);
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
        role: code,
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
            role: code,
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

  gatewayExpressApp.post('/admin-register',verifyBody, validate(adminSchema), verifyTokenSuperAdmin,async (req, res, next) => {
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
        role: 'admin',
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
      const dataType = await getType('30', res);
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
};
