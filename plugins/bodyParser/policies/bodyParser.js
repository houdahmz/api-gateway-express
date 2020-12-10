// const express = require('express');
// const axios = require('axios');
// module.exports = {
//     name: 'bodyparser',
//     schema: {
//       $id: 'http://express-gateway.io/schemas/policies/example-policy.json',
//       type: 'object',
//       properties: {
//         url: {
//           type: 'string',
//           //format: 'url',
//           default: ''
//         }
//       }
//     },
//     policy: (actionParams) => {
//       const that = this;
//       this.actionParams = express.json()
//       return (req, res, next) => {
//         // your custom logic
//         //const amount = req.body.amount;
//         console.log('executing policy-from-example-plugin with params', actionParams);
//         next() // calling next policy

//         console.log("inside bodyparser policy: ",req.query)



//       };
//     }
//   };

const express = require('express');
const jsonParser = require('express').json();
const urlEncodedParser = require("express").urlencoded({ extended: true });
const { PassThrough } = require("stream");

const bodyParser = require("body-parser");
const app = express();

require("body-parser").urlencoded({ limit: "50mb", extended: true }),
require("body-parser").json({ limit: "50mb", extended: true }),
require("express").json({ limit: "50mb", extended: true }), //-- use express.json
require("express").urlencoded({ limit: "50mb", extended: true }), //-- use express.urlencoded

module.exports = {
   name: 'bodyParser',
   schema: {
      $id: 'http://express-gateway.io/schemas/policies/example-policy.json',
      type: 'object',
      properties: {
      //   url: {
      //     type: 'string',
      //     //format: 'url',
      //     default: ''
      //   }
      }
    },
   policy: () => {
      return async (req, res, next) => {
 
            let bodyData = JSON.stringify(req.body);
            // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
            req.setHeader('Content-Type','application/json');
            req.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            req.write(bodyData);

         console.log("body in bodyparser policy",req.body)
         req.egContext.requestStream = new PassThrough();
         // req.headers['content-type'] = 'application/json';
         // req.egContext.requestStream.write(req.body);
         req.pipe(req.egContext.requestStream);
         return jsonParser(req, res, () => urlEncodedParser(req, res, next));
         // next() // calling next policy
         // or write response:  res.json({result: "this is the response"})
       };
   }
};

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const swaggerUi = require("swagger-ui-express"),
//      swaggerDocument = require("./docs/swagger.json");

// const app = express();


// app.use(cors(corsOptions));
// app.use(bodyParser.json({limit: '50mb', extended: true}));
// app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// const { PassThrough } = require("stream");
// const jsonParser = require("express").json();
// const urlEncodedParser = require("express").urlencoded({ extended: true });

// module.exports = {
//   name: 'bodyParser',
//   schema: {
//     $id: 'N/A',
//     type: 'object',
//     properties: {}
//   },
//   policy: () => {
//     return async (req, res, next) => {
//       req.egContext.requestStream = new PassThrough();
//       req.pipe(req.egContext.requestStream);
//       return jsonParser(req, res, () => urlEncodedParser(req, res, next));
//     };
//   }
// };

// return async (req, res, next) => {

//  };