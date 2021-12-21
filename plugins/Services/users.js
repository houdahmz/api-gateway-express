const axios = require('axios');
const services = require('express-gateway/lib/services/');
const env = require('../../config/env.config');
const util = require('../register/helpers/utils');
const status_code = require('../register/config');
const logger = require('../../config/Logger');

exports.getProfileByEmail = async (email, res) => {
    try {
        logger.info('Call getProfile: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=${ email}`);
    } catch (error) {
        // console.log("error",error)
        // console.log("error.response", error)

        if (!error.response) {
            if (error.message) {
                logger.error(error.message);
                util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
                return util.send(res);
            }
        }
        logger.error(`Error in getProfile :${ error.response.data}`);
        util.setError(error.response.status, error.response.statusText.CODE_ERROR.EMPTY);
        return util.send(res);
    }
};

exports.getProfileByPhone = async (phone, res) => {
    try {
        logger.info('Call getProfile: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?phone=${ phone}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        logger.error(`Error in getProfile :${ error.response.data}`);
        util.setError(error.response.status, error.response.statusText, status_code.CODE_ERROR.EMPTY);
        return util.send(res);
    }
};

exports.getTypeById = async (code, res) => {
    try {
        logger.info(`${'Call getType: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/`}${ code}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/${ code}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
        }
        logger.error(`Error in getType: ${ error.response.data}`);

        return res.status(error.response.status).send(error.response.data);
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getType = async (code, res) => {
    try {
        logger.info(`${'Call getType: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/`}${ code}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/${ code}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        logger.error(`Error in getType: ${ error.response.data}`);
        util.setError(error.response.status, error.response.statusText, status_code.CODE_ERROR.EMPTY);
        return util.send(res);

        // return res.status(error.response.status).send(error.response.data);
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.creteProfile = async (myUser, body, type, res) => {
    try {
        logger.info('Call postProfile: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
        logger.info(body);
        console.log('body.bodyyy',body);
        return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`, {
            id_user: myUser.id,
            first_name: myUser.firstname,
            last_name: myUser.lastname,
            phone: myUser.phone,
            typeId: type.data.data.id,
            created_by: myUser.id,

            image: body.image,
            patent: body.patent,
            photo: body.photo,
            cin: body.cin,
            commercial_register: body.commercial_register,
            city: body.city,
            zip_code: body.zip_code,
            adresse: body.adresse,
            activity: body.activity,
            canals: body.canals,
            id_commercial: body.id_commercial,

            location_x: body.location_x,
            location_y: body.location_y,
            imei: body.imei,


            isActive: false,
            confirmMail: false,
            team: false,
            demand: '1',
            fromWeb: body.fromWeb,
            profilCompleted: true,
            username: myUser.username,
            email: myUser.email,
            role: 'user',

        });
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        logger.error(`Error in createProfile :${ error.response.data}`);

        const deleted = services.user.remove(myUser.id);
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.EMPTY);
        return util.send(res);
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getProfile = async (id, res) => {
    try {
        logger.info(`${'Call getProfile: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/`}${ id}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/${ id}`);
    } catch (error) {
        console.log('error',error);
        console.log('error.response',error.response);
        console.log('error.message',error.message);

        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        logger.error(`Error in getting profile: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data.message, error.response.data.code);
        return util.send(res);
    }
};
// /////////////////////////////////////////////////////////////////////////
exports.getToken = async (username, password, client_id, client_secret, res) => {
    try {
        logger.info('Call getToken');
        console.log('bodyyy client_secret',client_secret);
        console.log('bodyyy client_id',client_id);

        return await axios.post(`${env.baseURL}:${env.HTTP_PORT}/oauth2/token`, {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: client_id,
            client_secret: client_secret,
        });
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        logger.error(`Error in getToken: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.SERVER);
        return util.send(res);
    }
};
// /////////////////////////////////////////////////////////////////////////

exports.getProfileByUsername = async (myUser,res) => {
    try {
        logger.info(`${'Call getProfileByUsername: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?username=`}${ myUser}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?username=${ myUser}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
        }
        logger.error(`Error in getProfileByUsername :${ error.response.data}`);
        return res.status(error.response.status).send(error.response.data);
    }
};

// ////////////////////////////////////////////////////////////////////////////////

exports.updateprofileConfirm = async (body, id,res) => {
    try {
        logger.info('Call updateprofileConfirm in complete-profile ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
        console.log('bodyyyyyyyyy', body);
        body.updated_by = id;
        body.updatedBy = id;
        return await axios.patch(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/${ id}`, body,
        );
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
        }
        logger.error('Error in updatinh profile: ');

        return res.status(error.response.status).send(error.response.data);
    }
};

// ////////////////////////////////////////////////////////////////////////////////

exports.createAdminProfile = async (agentUser, typeId, res) => {
    try {
        logger.info('Call post Profile agent: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`);

        return await axios.post(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`, {
            id_user: agentUser.id,
            first_name: agentUser.firstname,
            last_name: agentUser.lastname,
            phone: agentUser.phone,
            typeId: typeId,
            created_by: agentUser.id,

            team: true,
            isActive: true,
            confirmMail: false,
            profilCompleted: true,
            username: agentUser.username,
            email: agentUser.email,
            role: 'ROLE_ADMIN',


        });
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

// /////////////////////////////////////
exports.updateprofile = async (body, id,res) => {
    try {
      logger.info('Call updateProfile in complete-profile ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
      console.log('body', body);
      body.updated_by = id;
      body.updatedBy = id;
      return await axios.patch(
        `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/${id}`, body,
      );
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error in adding profile: ');

      return res.status(error.response.status).send(error.response.data);
    }
  };    
// //////////////////////////////////
exports.getProfileById = async (myUser,res) => {
    try {
        logger.info(`${'Call getProfileByUsername: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?id_user=`}${myUser}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?id_user=${myUser}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            return res.status(500).send({'error': error.message});
        }
        logger.error(`Error in getProfileByUsername :${ error.response.data}`);
        return res.status(error.response.status).send(error.response.data);
    }
};  
// //////////////////////////////////
exports.updateprofileByAdmin = async (body,res,req) => { // with id user
    try {
      logger.info('Call updateprofileByAdmin in complete-profile ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/`);
      console.log('body', body);
      body.updated_by = req.params.id;
      body.updatedBy = req.params.id;
      return await axios.patch(
        `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/${ req.params.id}`, body,
      );
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error in adding profile: ');

      return res.status(error.response.status).send(error.response.data);
    }
  };
// //////////////////////////////////
exports.getServiceByUser = async (id, res) => {
    try {
        logger.info(`${'Call getService: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/service-user?userId=`}${id}`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/service-user?size=100&userId=${id}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        logger.error(`Error in getting Service: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data.message, error.response.data.code);
        return util.send(res);
    }
};
exports.updateDeleted = async (body, id,res) => {
console.log('id',id);
    try {
      logger.info('Call update ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/updated_deleted`);
      console.log('body', body);
      return await axios.patch(
        `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/updated_deleted/${id}`, body,
      );
    } catch (error) {
      if (!error.response) {
        logger.error(error.message);
        return res.status(500).send({'error': error.message});
      }
      logger.error('Error in updating: ');

      return res.status(error.response.status).send(error.response.data);
    }
  };    
