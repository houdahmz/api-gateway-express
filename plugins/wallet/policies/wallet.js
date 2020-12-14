const express = require('express');
const axios = require('axios');
module.exports = {
    name: 'wallet',
    schema: {
      $id: 'http://express-gateway.io/schemas/policies/example-policy.json',
      type: 'object',
      properties: {
        amount: {
          type: 'string',
          //format: 'url',
          default: ''
        }
      }
    },
    policy: (actionParams) => {
      const that = this;
      this.actionParams = express.json()
      return (req, res, next) => {
        // your custom logic
        //const amount = req.body.amount;
        const checkWallet = async (amount) => {
          try {
            return await axios.get('http://localhost:8080/api/type_user')
          } catch (error) {
            console.error(error)
          }
        }
        console.log("inside check wallet plugin with body : ",req.body)
        console.log(" request body   : ",req.query.amount)
        console.log("req url   : ",req.url)
        console.log("action params  ",actionParams.amount);
        //console.log("w++++++++++ wallet result ",mywallet)
        let mywallet =  checkWallet(req.query.amount).then(result => {
         console.log("++++++++++ wallet data ",result.data.response)
          if (result.data.status == 'error') {
            return res.status(400).json(result.data);
          }
            
        }) ;
        // rcheck the amount is available from in user wallet 
        //if (amount>5)
        console.log("++++++++++ wallet data ++++++++")

        next();

      };
    }
  };