
const env = require("../../../config/env.config");
const statusCode = require("../config")
const log4j = require("../../../config/configLog4js.js");
const util = require("../helpers/utils");

    const getProfileByEmail = async (email) => {
        try {
          log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
  
          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?email=` + email)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ status: "Error", error: error.message, code: statusCode.CODE_ERROR.SERVER });
  
          }
          log4j.loggererror.error("Error in getProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }
  
      const getProfileByPhone = async (phone) => {
        try {
          log4j.loggerinfo.info("Call getProfile: " + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
  
          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile?phone=` + phone)
        } catch (error) {
          if (!error.response) {
            log4j.loggererror.error(error.message)
            return res.status(500).send({ status: "Error", error: error.message, code: statusCode.CODE_ERROR.SERVER });
  
          }
          log4j.loggererror.error("Error in getProfile :" + error.response.data)
          return res.status(error.response.status).send(error.response.data);
        }
      }
const validation = async (req, res, next) => {

  const {  email, phone, } = req.body
console.log("validation",validation)
  try {
    if(email){
            const getProfiled = await getProfileByEmail(email)
            console.log("getProfile", getProfiled.data)
            if (getProfiled.data.status == 'success') {
            console.log("getProfiled.data.data", getProfiled.data.data)
        
            if (getProfiled.data.data.data[0]) {
                return res.status(200).json({ status: "Error", error: "Email already exist", code: statusCode.CODE_ERROR.ALREADY_EXIST });
            }
            next()
            } else {
            return res.status(200).json({ message: getProfiled.data });
        
            }
    }

    if(phone){
            const getProfiledByPhone = await getProfileByPhone(phone)
            console.log("getProfiledByPhone", getProfiledByPhone.data)
            if (getProfiledByPhone.data.status == 'success') {
            console.log("getProfiledByPhone.data.data", getProfiledByPhone.data.data)
        
            if (getProfiledByPhone.data.data.data[0]) {
                return res.status(200).json({ status: "Error", error: "Phone already exist", code: statusCode.CODE_ERROR.ALREADY_EXIST });
            }
            next()
        
            } else {
            return res.status(200).json({ message: getProfiledByPhone.data });
        
            }
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Error in validation middleware" });
  }
};

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    return next();
  } catch (err) {
    // console.log(
    //   'err',
    //   err,
    // );
    // More logic goes here
    if (err.type == 'required') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.EMPTY,
      );
      return util.send(res);
    } else if (err.type == 'matches') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.TYPE,
      );
      return util.send(res);
    } else if (err.type == 'typeError' || err.type == 'min') {
      util.setError(
        '400',
        `${err.message}`,
        statusCode.CODE_ERROR.TYPE,
      );
    } else {
      util.setError(
        '400',
        `${err.message} (${err.name})`,
        statusCode.CODE_ERROR.OTHER,
      );
    }
    return util.send(res);
  }
};

module.exports = validate;
