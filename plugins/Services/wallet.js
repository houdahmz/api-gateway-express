const axios = require('axios');
const env = require('../../config/env.config');
const util = require('../register/helpers/utils');
const status_code = require('../register/config');
const logger = require('../../config/Logger');

exports.addWallet = async (body) => {
    try {
        logger.info('Call addWallet in wallet ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`);
        console.log('body', body);
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
            logger.error(error.message);
            return message;
        } else {
            const message = {
                status: error.response.status,
                data: error.response.data,
            };
            logger.error('Error in addWallet: ,error', error);
            // return res.status(error.response.status).send(error.response.data);
            return message;
        }
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getCurrency = async (res) => {
    try {
        logger.info('Call getCurrency: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/currency`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.EMPTY);
            return util.send(res);
        }
        logger.error(`Error in getCurrency: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data, status_code.CODE_ERROR.EMPTY);
        return util.send(res);
    }
};
// ////////////////////////////////////////////////////////////////////////////////
exports.getCategoryFromWalletWithCode = async (code, res) => {
    try {
        logger.info('Call getcategory: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category/`);

        return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category?name=${ code}`);
    } catch (error) {
        if (!error.response) {
            logger.error(error.message);
            util.setError(500, error.message, status_code.CODE_ERROR.SERVER);
            return util.send(res);
        }
        logger.error(`Error in getting getcategory: ${ error.response.data}`);
        util.setError(error.response.status, error.response.data.message, status_code.CODE_ERROR.SERVER);
        return util.send(res);
    }
};
// /////////////////////////////////////////////////////////////////////////
        exports.getWallet = async (idCompany,res) => {
            try {
              logger.info('Call getWallet: ' + `${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/`);
    
              return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet`,
                {
                  params: {
                    companyId: idCompany,
                  },
                });
            } catch (error) {
              if (!error.response) {
                logger.error(error.message);
                return res.status(500).send({'error': error.message});
              }
              logger.error(`Error in getting getWallet: ${ error.response.data}`);
    
              return res.status(error.response.status).send(error.response.data);
            }
          };
    
