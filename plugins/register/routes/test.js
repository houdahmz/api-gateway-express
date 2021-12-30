const services = require('express-gateway/lib/services/');
const user_service = require('../../../services/user/user.service');
const device = require('express-device');
const cors = require('cors');
const env = require('../../../config/env.config');
const http = require('http');
const fs = require('fs');
const getDirName = require('path').dirname;
const express = require('express'); 

const path = require('path');
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
  gatewayExpressApp.use('/upload', express.static('upload'));
  gatewayExpressApp.post('/upload', async (req, res, next) => {
      try {
        const {url} = req.body;
        let filePath = `upload/${url.split('/')[3]}`;
        // Create upload directory if not existe
        if (!fs.existsSync(getDirName(filePath))) { 
          fs.mkdirSync(getDirName(filePath));
        }

        if (url.split('/').length == 6) {
          filePath = `upload/${url.split('/')[3]}/${url.split('/')[4]}/${url.split('/')[5]}`;

          if (!fs.existsSync(getDirName(`upload/${url.split('/')[3]}/${url.split('/')[4]}`))) {
            fs.mkdirSync(getDirName(`upload/${url.split('/')[3]}/${url.split('/')[4]}`));
          }
          if (!fs.existsSync(getDirName(filePath))) {
            fs.mkdirSync(getDirName(filePath));
          }
        } else if (url.split('/').length == 5) {
          filePath = `upload/${url.split('/')[3]}/${url.split('/')[4]}`;

          if (!fs.existsSync(getDirName(filePath))) {
            fs.mkdirSync(getDirName(filePath));
          }
        } 

      const file = fs.createWriteStream(filePath);
      const request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(); // close() is async, call cb after close completes.
        });
      }).on('error', function(err) { // Handle errors
        console.log('err',err);
        fs.unlink(filePath, function() {
          console.log('Deleted');
          }); // Delete the file async. (But we don't check the result)
        return res.status(200).json({status: 'error', path: null, error: err, code: status_code.CODE_ERROR.ALREADY_EXIST});
      });
      setTimeout(function() {
        console.log('TimeOut');
        fs.unlink(filePath, function() {
        console.log('Deleted');
        });
      }, 10000);

      return res.status(200).json({status: 'success', path: env.URL + filePath, code: status_code.CODE_SUCCESS.SUCCESS});
      } catch (error) {
      console.log('error',error);
      return res.status(200).json({status: 'error', path: null, error: error, code: status_code.CODE_ERROR.ALREADY_EXIST});
      }
  });
};
