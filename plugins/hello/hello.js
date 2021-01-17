// const bodyParser = require("body-parser");
// const express = require('express');
// const jsonParser = require('express').json();
// const urlEncodedParser = require("express").urlencoded({ extended: true });
// const { PassThrough } = require("stream");

const bodyParser = require("body-parser");
// const app = express();
const { user } = require('express-gateway/lib/services/');

// const jsonParser = require('express').json();
// const urlEncoded = require('express').urlencoded({ extended: true });
const { PassThrough } = require('stream');
// const transformObject = require('./transform-object');
// const formurlencoded = require('form-urlencoded').default;

// require("body-parser").urlencoded({ limit: "50mb", extended: true }),
// require("body-parser").json({ limit: "50mb", extended: true }),
// require("express").json({ limit: "50mb", extended: true }), //-- use express.json
// require("express").urlencoded({ limit: "50mb", extended: true }), //-- use express.urlencoded


module.exports = function (gatewayExpressApp) {
    // gatewayExpressApp.use(bodyParser.json())
  // gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  // gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    gatewayExpressApp.get('/hello', (req, res) => {
      res.json({hello: 'Express-Gateway'});
    });
    gatewayExpressApp.post('/hello', (req, res) => {
      let contentType = 'application/x-www-form-urlencoded';


      // jsonParser(req, res, (err) => {
      //   // if (err) return next(err);
      //   if (Object.keys(req.body).length !== 0) contentType = 'application/json';

      //   urlEncoded(req, res, (err) => {
      //     // if (err) return next(err);
      //     if (Object.keys(req.body).length === 0) contentType = 'application/json';

      //     const serializeFn = contentType === 'application/json' ? JSON.stringify : formurlencoded;

      //     const bodyData = serializeFn(transformObject(params.body, req.egContext, req.body));

      //     req.headers['content-length'] = Buffer.byteLength(bodyData);
      //     req.headers['content-type'] = contentType;

      //     req.egContext.requestStream = new PassThrough();
      //     req.egContext.requestStream.write(bodyData);

      //   });
      // });
      req.headers['content-length'] = Buffer.byteLength(req.body);
      req.headers['content-type'] = contentType;

      req.egContext.requestStream = new PassThrough();
      req.egContext.requestStream.write(req.body);


      console.log("body",req.body)
        res.json({hello: 'Express-Gateway'});
      }
      
      );
  };