const log4j = require('../../config/configLog4js.js');
const axios = require('axios');
const services = require('express-gateway/lib/services/');
const env = require('../../config/env.config');
const util = require('../register/helpers/utils');
const status_code = require('../register/config');

exports.addWallet = async (body) => {
    try {
        log4j.loggerinfo.info('Call addWallet in wallet ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`);
        console.log('bodyyyyyyyyy', body);
        // body.updated_by = id
        // body.updatedBy = id
        return await axios.post(
            `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`, body,
        );
    } catch (error) {
        if (!error.response) {
            const message = {
                data: error.response,
            };
            log4j.loggererror.error(error.message);
            return message;
        } else {
            const message = {
                status: error.response.status,
                data: error.response.data,
            };
            log4j.loggererror.error('Error in addWallet: ,error', error);
            // return res.status(error.response.status).send(error.response.data);
            return message;
        }
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getCurrency = async (res) => {
    try {
        log4j.loggerinfo.info('Call getCurrency: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency`);
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        log4j.loggererror.error(`Error in getCurrency: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.EMPTY);
        return util.send(res);
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getCategoryFromWalletWithCode = async (code, res) => {
    try {
        log4j.loggerinfo.info('Call getcategory: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category/`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category?name=${ code}`);
    } catch (error) {
        if (!error.response) {
            log4j.loggererror.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        log4j.loggererror.error(`Error in getting getcategory: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data.message, status_code.CODE_ERROR.SERVER);
        return util.send(res);
    }
};
// /////////////////////////////////////////////////////////////////////////
        exports.getWallet = async (idCompany,res) => {
            try {
              log4j.loggerinfo.info('Call getWallet: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/`);
    
              return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`,
                {
                  params: {
                    companyId: idCompany,
                  },
                });
            } catch (error) {
              if (!error.response) {
                log4j.loggererror.error(error.message);
                return res.status(500).send({'error': error.message});
              }
              log4j.loggererror.error(`Error in getting getWallet: ${ error.response.data}`);
    
              return res.status(error.response.status).send(error.response.data);
            }
          };
    
