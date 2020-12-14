const services = require('express-gateway/lib/services/')
const axios = require('axios');
const CircularJSON = require('circular-json');
const bodyParser = require("body-parser");

module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


  gatewayExpressApp.post('/api-g/voucher', async (req, res, next) => { // code=20 for agent created by admin
    try {
console.log("post /api-g/voucher")
      const calculateVoucher = async () => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.post('http://localhost:5001/api/transaction/calculate',{
            FacialId : req.body.FacialId,
            OperatorId : req.body.OperatorId,
            quantity : req.body.quantity
          })
        } catch (error) {
          console.error(error)
        }
      }

      const checkSolde = async (amount) => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.post('http://localhost:5003/api/wallet/check-wallet',
          {
            amount:amount,
            company_id:"83f7bd5f-5439-4b7a-b6f1-c30561a9acd0",
            createdBy:"83f7bd5f-5439-4b7a-b6f1-c30561a9acd0",
            serviceId:"383de47e-d6bf-4ada-9a1c-19b3d286c369",
            category_id:"6ad65d78-c5ea-4881-a5cf-b9233c287c37"
        })
        } catch (error) {
          console.error(error)
        }
      }

      const getVoucher = async () => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.post('http://localhost:5001/api/transaction',{
            FacialId : req.body.FacialId,
            OperatorId : req.body.OperatorId,
            quantity : req.body.quantity
          })
        } catch (error) {
          console.error(error)
        }
      }

      const myres = await calculateVoucher();
      if(myres.data.status == "success"){

        const myresC = await checkSolde(myres.data.data);
        if (myresC.data.data.authorize == true ){
            const myresV = await getVoucher();
            return res.status(200).json(myresV.data);

        }else {
            return res.status(200).json(myresC.data);

        }

      }else {
        return res.status(200).json(myres.data);
      }

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }



  });


  gatewayExpressApp.get('/api/facial', async (req, res, next) => { // code=20 for agent created by admin
    try {
      const createAgentProfile = async () => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.get('http://localhost:8080/api/facial')
        } catch (error) {
          console.error(error)
        }
      }

      const userProfile = await createAgentProfile();
      return res.status(200).json(userProfile.data);

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });


  function verifyApiKey(req, res, next) {

    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      // const bearer = bearerHeader.split(' ');
      // const bearerToken = bearer[1];
      // req.token = bearerToken;
      req.Value = bearerHeader;
      req.Key = "Authorization";
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  }


};






