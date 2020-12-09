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


module.exports = {
   name: 'bodyParser',
   schema: {
      $id: 'http://express-gateway.io/schemas/policies/example-policy.json',
      type: 'object',
      properties: {

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

