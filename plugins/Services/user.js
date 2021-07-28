const axios = require('axios');
const utils = require('express-gateway/lib/services/utils')
const log4j = require("../../../config/configLog4js.js");
    
const env = require("../../../config/env.config");

    //////////////////////////////////////////////////////////////////////////////////
    const updateprofile = async (body,id) => {

        try {
      log4j.loggerinfo.info("Call updateProfile in complete-profile "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile`);
      console.log("bodyyyyyyyyy",body)
      body.updated_by = id
      body.updatedBy = id
          return await axios.patch(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/` + id, body
          )
        } catch (error) {
          if(!error.response){
            log4j.loggererror.error(error.message)
            return error.message;
          }
        log4j.loggererror.error("Error in adding profile: ")
          return error.response.data;
        }
      }
    //////////////////////////////////////////////////////////////////////////////////
