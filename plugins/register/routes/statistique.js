/* eslint-disable no-unused-vars */
/* eslint-disable brace-style */
/* eslint-disable guard-for-in */
const device = require('express-device');
const MobileDetect = require('mobile-detect');
const logger = require('../../../config/Logger');
const env = require('../../../config/env.config');
const axios = require('axios');

const cors = require('cors');

const bodyParser = require('body-parser');
const corsOptions = {
  origin: '*',
};
const {
    verifyTokenSuperAdminOrAdmin,verifyTokenUser,
  } = require('./middleware');
  
const swaggerUi = require('swagger-ui-express');
     const swaggerDocument = require('../../../doc/swagger.json');
     const rateLimit = require('express-rate-limit');
     const apiLimiter = rateLimit({
      windowMs: 2 * 60 * 1000, // 2 minutes
      max: 2, // limite chaque adresse IP à 100 requêtes par windowMs
      message: {
        status: 'Error',
        error: 'Tentatives de connexion trop nombreuse, veuillez réessayer dans 2 min'},
      headers: true,
      });
module.exports = function(gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({limit: '50mb', extended: true}));
  gatewayExpressApp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  gatewayExpressApp.use(cors(corsOptions));
  gatewayExpressApp.use(device.capture());

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
};
