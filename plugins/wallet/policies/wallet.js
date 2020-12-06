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
            return await axios.post('http://localhost:8080/api/voucher/wallet', {
              userID : "54875-98563-56987-457" ,
              amount : amount
            })
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
         console.log("++++++++++ wallet data ",result.data)
          if (result.data.status == 'error') {
            return res.status(400).json(result.data);
          }
            next();
        }) ;
        // rcheck the amount is available from in user wallet 
        //if (amount>5)
      
      };
    }
  };