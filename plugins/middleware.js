const os = require('os');
const useragent = require('express-useragent');
const services = require('express-gateway/lib/services/');
const {lookup} = require('geoip-lite');
const iplocate = require('node-iplocate');
const ipF = require('ip');
const {
getProfile,
} = require('./Services/users');

const {
getCategoryFromWalletWithCode,
} = require('./Services/wallet');

const publicIp = require('public-ip');
const middlewarePlugin = {
  schema: {$id: './../config/models/schema.js'},
  version: '1.0.0',
  policies: ['plugin'],
  init: function(pluginContext) {
    pluginContext.registerPolicy({
      name: 'middleware',
      policy: (params) =>
        async function(req, res, next) {
          console.log('in middleware gateway');
          try {
            console.log('in middleware gateway',req.body);
            const ip = (typeof req.headers['x-forwarded-for'] === 'string' &&
            req.headers['x-forwarded-for'].split(',').shift()) || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
         console.log('ip',ip);
         console.log('new Date()',new Date().toString());


         console.log('os.platform()',os.platform());
         console.log('os.release()',os.release());
         console.log('os.type()',os.type()); // "Windows_NT"
        const publicIpAdd = await publicIp.v4();

         const source = req.headers['user-agent'];
         const ua = useragent.parse(source);
         console.log('ua.source',ua.source);

         const {isMobile} = ua;
         console.log('isMobile',isMobile);

         console.log('lookup(ip)',lookup(ip));
         console.log('lookup(ip)',lookup(ip));
        const endpointScopes = req.egContext.apiEndpoint;
        console.log('endpointScopes',endpointScopes);
        console.log('*********************************');
        console.log('req.egContext.apiEndpoint.methods check',req.egContext.apiEndpoint.methods.includes('GET'));
            if (req.egContext.apiEndpoint.methods.includes('GET')) {
              console.log('Methode GET');
            }
            let data;
            const {body} = req;

            if (body.user) {
            data = body.user;
            } else if (req.user) {
              data = req.user;
            }
            

                if (data) {
                    const userUpdated = await services.user.update(data.consumerId, { 
                        ip: publicIpAdd ,
                        os: os.platform(),
                        source: ua.source,
                        last_login: new Date().toString(),
                    
                    });
                    // userUpdated = await services.user.update(data.consumerId, { os: os.platform(),source: ua.source })
                    console.log('userUpdated',userUpdated);
                    console.log('req.device.type.toUpperCase()',req.device.type.toUpperCase());

                    const user = await services.user.findByUsernameOrId(data.consumerId);
                    console.log('user', user);

                body.created_by = data.consumerId;
                body.deleted_by = data.consumerId;
                body.updated_by = data.consumerId;
                
                body.createdBy = data.consumerId;
                body.deletedBy = data.consumerId;
                body.updatedBy = data.consumerId;

                body.userId = data.consumerId;
                body.id_user = data.consumerId;


                console.log('body after ',body);
      /** *******************************************Call profile */

      try {
        data = await getProfile(data.consumerId);
      } catch (error) {
        console.log('error getProfile', error); // // tkt
        if (!error.response) {
          // log4j.loggererror.error(error.message)
          return res.status(500).send({'error getProfile in Gateway': error.message});
        }
        // log4j.loggererror.error("Error in getting profile: "+error.response.data)

        return res.status(error.response.status).send(error.response.data);
      }
      /** *********************************************************************************************/
      let dataCategory;

      if (data.data) {
        if (data.data.data) {
      console.log('data.data.data',data.data.data);
      body.CompanyId = data.data.data.CompanyId;
      body.company_id = data.data.data.CompanyId;

      if (data.data.data.Company) {
        if (data.data.data.Company.Category) {
          console.log('data.data.data.Company',data.data.data.Company);
          
            console.log('data.data.data.Category',data.data.data.Company.Category);
            if (data.data.data.Company.Category) {
              const {code} = data.data.data.Company.Category;
              console.log('cooooode ',code);
              try {
                dataCategory = await getCategoryFromWalletWithCode(code);
              } catch (error) {
                console.log('error', error); // // tkt
                if (!error.response) {
                  // log4j.loggererror.error(error.message)
                  return res.status(500).send({'Error getCategory in Gateway': error.message});
                }
                // log4j.loggererror.error("Error in getting profile: "+error.response.data)
            
                return res.status(error.response.status).send(error.response.data);
              }
            }
              }
      }
        }
      }
      /** ************************************************************************************ */
      if (dataCategory) {
      console.log('dataCategory.data',dataCategory.data);
      console.log('dataCategory status',dataCategory.status);

        if (dataCategory.data.data) {
          console.log('********categoryId ************',dataCategory.data.data.items[0].id);
          body.category_id = dataCategory.data.data.items[0].id;
          body.categoryId = dataCategory.data.data.items[0].id;
        } else {
          body.category_id = null;
          body.categoryId = null;
        }
        } else {
          body.categoryId = null;
          body.category_id = null;
        }

      /** ************************************************************************************ */
                }
                console.log('body after ',body);

                next();
          } catch (error) {
            const errorObject = {message: error.message, reason: error.name};
            console.log(errorObject);
            return res.status(400).send(errorObject);
          }
        },
    },
    );
  },
};


module.exports = middlewarePlugin;
