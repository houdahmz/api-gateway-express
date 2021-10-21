const log4j = require("../../config/configLog4js.js");
const axios = require('axios');
const services = require('express-gateway/lib/services/')
const env = require("../../config/env.config");
const util = require("../register/helpers/utils");
const status_code = require("../register/config")

exports.getProfileByEmail = async (email, res) => {
    try {
        log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=` + email)
    } catch (error) {
        // console.log("error",error)
        console.log("error.response", error.response)

        if (!error.response) {
            if (error.message) {
                log4j.loggererror.error(error.message)
                util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
                return util.send(res);

            }


        }
        log4j.loggererror.error("Error in getProfile :" + error.response.data)
        util.setError(error.response.status, error.response.statusText.CODE_ERROR.EMPTY);
        return util.send(res);

    }
}

exports.getProfileByPhone = async (phone, res) => {
    try {
        log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?phone=` + phone)
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        log4j.loggererror.error("Error in getProfile :" + error.response.data)
        util.setError(error.response.status, error.response.statusText, status_code.CODE_ERROR.EMPTY);
        return util.send(res);
    }
}

exports.getTypeById = async (code, res) => {
    try {
        log4j.loggerinfo.info("Call getType: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/` + code);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/` + code)
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error in getType: " + error.response.data)

        return res.status(error.response.status).send(error.response.data);
    }
}
//////////////////////////////////////////////////////////////////////////////////
exports.getType = async (code, res) => {
    try {
        log4j.loggerinfo.info("Call getType: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/type-user/by_code/` + code)
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);

        }
        log4j.loggererror.error("Error in getType: " + error.response.data)
        util.setError(error.response.status, error.response.statusText, status_code.CODE_ERROR.EMPTY);
        return util.send(res);

        // return res.status(error.response.status).send(error.response.data);
    }
}
//////////////////////////////////////////////////////////////////////////////////
exports.creteProfile = async (myUser, body, type, res) => {
    try {
        log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

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
            id_commercial: body.id_commercial,

            isActive: false,
            confirmMail: false,
            team: false,
            demand: "1",

            profilCompleted: true,
            username: myUser.username,
            email: myUser.email,
            role: "ROLE_USER",

        })
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);

        }
        log4j.loggererror.error("Error in createProfile :" + error.response.data)

        const deleted = services.user.remove(myUser.id);
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.EMPTY);
        return util.send(res);

    }
}
///////////////////////////////////////////////////////////////////////////
// exports.getProfile = async (myUser) => { // de registration_confirm
//   try {
//     log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

//     return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?id_user=` + myUser.id)
//   } catch (error) {
//     if (!error.response) {
//       log4j.loggererror.error(error.message)
//       return res.status(500).send({ "error": error.message });
//     }
//     log4j.loggererror.error("Error in getProfile :" + error.response.data)
//     return res.status(error.response.status).send(error.response.data);
//   }
// }
//////////////////////////////////////////////////////////////////////////////////

exports.getProfile = async (id, res) => {
    try {
        log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id)
    } catch (error) {
        console.log("aaaaaaa111111111111111111")
        if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        log4j.loggererror.error("Error in getting profile: " + error.response.data)
        util.setError(error.response.status, error.response.data.message, error.response.data.code);
        return util.send(res);

    }
}
///////////////////////////////////////////////////////////////////////////
exports.getToken = async (username, password, client_id, client_secret, res) => {
    try {
        log4j.loggerinfo.info("Call getToken");
        console.log("bodyyy client_secret",client_secret)
        console.log("bodyyy client_id",client_id)

        return await axios.post(`${env.baseURL}:${env.HTTP_PORT}/oauth2/token`, {
            grant_type: "password",
            username: username,
            password: password,
            client_id: client_id,
            client_secret: client_secret
        })
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);

        }
        log4j.loggererror.error("Error in getToken: " + error.response.data)
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.SERVER);
        return util.send(res);

    }
}
///////////////////////////////////////////////////////////////////////////
// exports.getProfileByEmail = async (myUser) => {
//   try {
//     log4j.loggerinfo.info("Call postProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);

//     return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=` + myUser)
//   } catch (error) {
//     if (!error.response) {
//       log4j.loggererror.error(error.message)
//       return res.status(500).send({ status: "Error", error: error.message, code: status_code.CODE_ERROR.SERVER });

//     }
//     log4j.loggererror.error("Error in getProfile :" + error.response.data)
//     return res.status(error.response.status).send(error.response.data);
//   }
// }

///////////////////////////////////////////////////////////////////////////


/************************************ */

exports.getProfileByUsername = async (myUser,res) => {
    try {
        log4j.loggerinfo.info("Call getProfileByUsername: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?username=` + myUser);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?username=` + myUser)
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error in getProfileByUsername :" + error.response.data)
        return res.status(error.response.status).send(error.response.data);
    }
}

//////////////////////////////////////////////////////////////////////////////////

exports.updateprofileConfirm = async (body, id,res) => {

    try {
        log4j.loggerinfo.info("Call updateprofileConfirm in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
        console.log("bodyyyyyyyyy", body)
        body.updated_by = id
        body.updatedBy = id
        return await axios.patch(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
        )
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error in updatinh profile: ")

        return res.status(error.response.status).send(error.response.data);
    }
}

//////////////////////////////////////////////////////////////////////////////////

exports.createAdminProfile = async (agentUser, typeId, res) => {

    try {
        log4j.loggerinfo.info("Call post Profile agent: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/agent`);

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
            role: "ROLE_ADMIN",


        })
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ "error": error.message });
        }
        log4j.loggererror.error("Error in adding profile: ")
        const deleted = services.user.remove(myUser.id);

        return res.status(error.response.status).send(error.response.data);

    }
}

///////////////////////////////////////
exports.updateprofile = async (body, id,res) => {

    try {
      log4j.loggerinfo.info("Call updateProfile in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
      console.log("bodyyyyyyyyy", body)
      body.updated_by = id
      body.updatedBy = id
      return await axios.patch(
        `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
      )
    } catch (error) {
      if (!error.response) {
        log4j.loggererror.error(error.message)
        return res.status(500).send({ "error": error.message });
      }
      log4j.loggererror.error("Error in adding profile: ")

      return res.status(error.response.status).send(error.response.data);
    }
  }    
////////////////////////////////////
exports.updateprofileByAdmin = async (body,res) => { //with id user

    try {
      log4j.loggerinfo.info("Call updateprofileByAdmin in complete-profile " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/`);
      console.log("bodyyyyyyyyy", body)
      body.updated_by = req.params.id
      body.updatedBy = req.params.id
      return await axios.patch(
        `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/admin/company/` + req.params.id, body
      )
    } catch (error) {
      if (!error.response) {
        log4j.loggererror.error(error.message)
        return res.status(500).send({ "error": error.message });
      }
      log4j.loggererror.error("Error in adding profile: ")

      return res.status(error.response.status).send(error.response.data);
    }
  }