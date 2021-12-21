/* eslint-disable max-lines-per-function */
const services = require('express-gateway/lib/services/');
const util = require('../helpers/utils');
const user_service = require('../../../services/user/user.service');

const validate = require('../middleware/validation');
const {patchTeamSchema} = require('../schemaValidation/register');

const logger = require('../../../config/Logger');

const device = require('express-device');
const cors = require('cors');
const {
  getTypeById, getProfile, updateprofile, updateprofileByAdmin,
} = require('../../Services/users');

const {
  addUser, updateUser,
} = require('../../Services/function');

const {
  verifyBody,
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

  gatewayExpressApp.patch('/update-team/:id', verifyBody,validate(patchTeamSchema),async (req, res, next) => { // incomplete {add send mail with url /change_password} 
    try {
      const {firstname, lastname, email, phone, role} = req.body.user;
      const {type_userId} = req.body.profile;
      console.log('req.body',req.body);

      const myUser = await services.user.findByUsernameOrId(req.params.id);
      console.log('myUser before update', myUser);
      if (myUser == false) {
        logger.error('User does not exist');
        return res.status(200).json({status: 'error', message: 'The user does not exist'});
      }

      // ///////////////////////////getTypeById/////////////////////////////////////////////////////
      let dataType;
      if (type_userId) {
        dataType = await getTypeById(type_userId, res);
        console.log('dataType.data.data', dataType.data);
        if (!dataType.data.data) {
          logger.error('Error Problem in server ');
          return res.status(500).send({status: 'Error', error: 'Internal Server Error', code: status_code.CODE_ERROR.SERVER});
        }
        if (dataType.data.data.code == status_code.CODE_SUCCESS.LIST_EMPTY) {
          logger.error('Error Problem in server ');
          return res.status(200).send({status: 'Error', message: dataType.data.data.message, code: status_code.CODE_SUCCESS.LIST_EMPTY});
        }
      }

      // const code = dataType.data.data.data.type
      const code = role;
      
      // ///////////////////////////update user/////////////////////////////////////////////////////
      try {
        const myUserUpdated = await updateUser(myUser.id,req.body.user,[code]);
        console.log('myUser after update',myUserUpdated);
      } catch (error) {
      util.setError(200, error.message,status_code.CODE_ERROR.ALREADY_EXIST);
      return util.send(res);
      }
      // ////////////////////////////Get profile///////////////////////////////////
      if (type_userId) {
        req.body.user.type_userId = req.body.profile.type_userId;
      }

      const getProfiled = await getProfile(myUser.id, res);
      console.log('getProfiled.data', getProfiled.data);
        if (getProfiled.data.status == 'success') {
          console.log('id profile', getProfiled.data.data.id);
          console.log('myUser.id', myUser.id);
          const bodyProfile = {
            email: email,
            phone: phone,
            first_name: firstname,
            last_name: lastname,
            role: role,
            TypeUserId: type_userId,
          };
      // ///////////////////////////update profile/////////////////////////////////////////////////////
          const userProfile = await updateprofile(bodyProfile, getProfiled.data.data.id, res);
          if (!userProfile.data) {
            logger.error('Error Problem in server ');
            return res.status(500).json({'Error': 'Problem in server'});
          }
          logger.info('The user has been updated');
          return res.status(200).json({status: 'success', message: 'The user has been updated'});
        } else {
          return res.status(200).json({message: getProfiled.data});
        }
    } catch (err) {
      logger.error(`Error :${ err.message}`);
      return res.status(422).json({error: err.message});
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
