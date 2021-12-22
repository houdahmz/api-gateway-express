const services = require('express-gateway/lib/services/');
const user_service = require('../../../services/user/user.service');
const device = require('express-device');
const cors = require('cors');
const env = require('../../../config/env.config');


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

  gatewayExpressApp.get('/search', async (req, res, next) => {
    const {username, phone, email} = req.query;
     // false if exist & true if does not exist
    let myUser = false; // false  does not 
    if (username) {
      myUser = await services.user.findByUsernameOrId(username);
      if (myUser) myUser = true;
      else myUser = false;
      console.log('myUser',myUser);
    }
    let findByEmail = false;
    if (email) {
      findByEmail = await user_service.findByEmail(decodeURIComponent(email));
      if (findByEmail) findByEmail = true;
      else findByEmail = false;
      console.log('findByEmail',findByEmail);
    }
    let findByPhone = false;
    if (phone) {
      findByPhone = await user_service.findByPhone(phone);
      if (findByPhone) findByPhone = true;
      else findByPhone = false;
      console.log('findByPhone',findByPhone);
    }
    console.log('!findByPhone & !findByEmail & !myUser',!findByPhone & !findByEmail & !myUser);

    if (!findByPhone & !findByEmail & !myUser) {
return res.status(200).json({status: 'success', exist: true , message: 'Does not exist', code: status_code.CODE_ERROR.NOT_EXIST});
}
     return res.status(200).json({status: 'success', exist: false, message: 'Already exist', code: status_code.CODE_ERROR.ALREADY_EXIST});
  });
};
