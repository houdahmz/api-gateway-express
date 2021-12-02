const express = require('express');
const axios = require('axios');
module.exports = {
    name: 'register',
    schema: {
      $id: 'http://express-gateway.io/schemas/policies/example-policy.json',
      type: 'object',
      properties: {
        url: {
          type: 'string',
          // format: 'url',
          default: '',
        },
      },
    },
    policy: (actionParams) => {
      const that = this;
      this.actionParams = express.json();
      return (req, res, next) => {
        // your custom logic
        // const amount = req.body.amount;
        console.log('inside voucher policy: body ',res.body);

        console.log('inside voucher policy: ',req.query);
        next();
      };
    },
  };
