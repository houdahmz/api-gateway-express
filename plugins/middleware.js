const os = require('os');
useragent = require('express-useragent');
const services = require('express-gateway/lib/services/')
const { lookup } = require('geoip-lite');
const iplocate = require("node-iplocate");
var moment = require('moment');
var ipF = require("ip");


const axios = require('axios');
const env = require("../config/env.config");


const publicIp = require('public-ip');

const middlewarePlugin = {
  schema: { $id: "./../config/models/schema.js" },
  version: '1.0.0',
  policies: ['plugin'],
  init: function (pluginContext) {
    pluginContext.registerPolicy({
      name: 'middleware',
      policy: (params) =>
        async function (req, res, next) {
          console.log("in middleware gateway")
          try {
            console.log("icii in middleware gateway",req.body)
            var ip = (typeof req.headers['x-forwarded-for'] === 'string'
            && req.headers['x-forwarded-for'].split(',').shift()) || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress
         console.log("ip",ip)
        //  console.log("Date.now()",Date.now().toString())
         console.log("new Date()",new Date().toString())
         


         console.log("os.platform()",os.platform())
         console.log("os.release()",os.release())
         console.log("os.type()",os.type()); // "Windows_NT"
        //  console.log("lookup",lookup("192.168.0.115")); // location of the user
        //  console.log("iplocate",iplocate(ip)); // location of the user
        //  console.log("iplocate",iplocate(ip).country); // location of the user
        //  console.log(iplocate(ip)); // location of the user
        // 192.168.0.115
        //  iplocate("192.168.0.115").then(function(results) {
        //     console.log("IP Address: " + results.ip);
        //     console.log("Country: " + results.country + " (" + results.country_code + ")");
        //     console.log("Continent: " + results.continent);
        //     console.log("Organisation: " + results.org + " (" + results.asn + ")");
           
        //     console.log(JSON.stringify(results, null, 2));
        //   });
        // let addr = ipF.address()
        const publicIpAdd = await publicIp.v4();

          // const results = await iplocate(publicIpAdd) 
          // console.log("results",results)


         var source = req.headers['user-agent']
         var ua = useragent.parse(source);
        //  console.log("ua",ua)
         console.log("ua.source",ua.source)

         var isMobile = ua.isMobile
         console.log("isMobile",isMobile)

         console.log("lookup(ip)",lookup(ip))
         console.log("lookup(ip)",lookup(ip))
        //  console.log("iplocate",iplocate(ip)); // location of the user
        endpointScopes = req.egContext.apiEndpoint;
        console.log("endpointScopes",endpointScopes)
	console.log("*********************************")	
      ///////////

      const getProfile = async (id) => {
        try {
        // log4j.loggerinfo.info("Call getProfile: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/user-management/profile/by_userId/` + id)
        } catch (error) {
          if(!error.response){
            // log4j.loggererror.error(error.message)
            return res.status(500).send({"error":error.message});
          }
          // log4j.loggererror.error("Error in getting profile: "+error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////
      const getCategoryFromWalletWithCode = async (code) => {
        try {
        // log4j.loggerinfo.info("Call getcategory: "+`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category/`);

          return await axios.get(`${env.baseURL}:${env.HTTP_PORT_API_MANAGEMENT}/api-management/wallet/category?name=`+code)
        } catch (error) {
          if(!error.response){
            // log4j.loggererror.error(error.message)
            return res.status(500).send({"error":error.message});
          }
          // log4j.loggererror.error("Error in getting getcategory: "+error.response.data)

          return res.status(error.response.status).send(error.response.data);
        }
      }
      ///////////
            // if(endpointScopes.methods == ['GET']){

            // }
		console.log("req.egContext.apiEndpoint.methods check",req.egContext.apiEndpoint.methods.includes("GET"))
    if(req.egContext.apiEndpoint.methods.includes("GET")){
      console.log("Methode GET")
      
    }
            var data;
            let body = req.body;

            if (body.user) {
            data = body.user
              
            } 
            else if (req.user){
              data = req.user
            }
            

                if(data){

                    let userUpdated = await services.user.update(data.consumerId, { 
                        ip: publicIpAdd ,
                        os: os.platform(),
                        source: ua.source,
                        // country:results.country,
                        // city:results.city,
                        // latitude:results.latitude,
                        // longitude:results.longitude,
                        // geoip: lookup(ip),
                        last_login: new Date().toString()
                    
                    })
                    // userUpdated = await services.user.update(data.consumerId, { os: os.platform(),source: ua.source })
                    console.log("userUpdated",userUpdated)
                    console.log("req.device.type.toUpperCase()",req.device.type.toUpperCase())

                    const user = await services.user.findByUsernameOrId(data.consumerId)
                    console.log("user", user)

                // console.log("body before",body)
                body.created_by = data.consumerId
                body.deleted_by = data.consumerId
                body.updated_by = data.consumerId
                
                body.createdBy = data.consumerId
                body.deletedBy = data.consumerId
                body.updatedBy = data.consumerId

                body.userId = data.consumerId


                console.log("body after ",body)
/*********************************************Call profile */

      /**************************** */

      var data;
      try {
        data = await getProfile(data.consumerId)

      } catch (error) {
        console.log("error getProfile", error) //// tkt
        if(!error.response){
          // log4j.loggererror.error(error.message)
          return res.status(500).send({"error getProfile in Gateway":error.message});
        }
        // log4j.loggererror.error("Error in getting profile: "+error.response.data)

        return res.status(error.response.status).send(error.response.data);

      }
/***********************************************************************************************/
var dataCategory;

if(data.data){
  if(data.data.data){
console.log("data.data.data",data.data.data)
body.CompanyId = data.data.data.CompanyId
body.company_id = data.data.data.CompanyId

if (data.data.data.Company){
  if (data.data.data.Company.Category){
    console.log("data.data.data.Company",data.data.data.Company)
    
      console.log("data.data.data.Category",data.data.data.Company.Category)
      if(data.data.data.Company.Category){
        var code = data.data.data.Company.Category.code
        console.log("cooooode ",code)
        try {
          dataCategory = await getCategoryFromWalletWithCode(code)
      
        } catch (error) {
          console.log("error", error) //// tkt
          if(!error.response){
            // log4j.loggererror.error(error.message)
            return res.status(500).send({"Error getCategory in Gateway":error.message});
          }
          // log4j.loggererror.error("Error in getting profile: "+error.response.data)
      
          return res.status(error.response.status).send(error.response.data);
      
        }
      }
    
        }
}

  
  }
}
      /************************************************************************************** */
      if(dataCategory){
      console.log("dataCategory.data",dataCategory.data)
      console.log("dataCategory status",dataCategory.status)

        if(dataCategory.data.data.data){
          console.log("********categoryId ************",dataCategory.data.data.data.items[0].id)
          body.category_id = dataCategory.data.data.data.items[0].id
        }else {
          body.category_id = null
        
        }
        
}else {
  body.categoryId = null

}

      /************************************************************************************** */

                
                }

                next()
          }
          catch (error) {
            let errorObject = { message: error.message, reason: error.name }
            console.log(errorObject);
            res.status(400).send(errorObject);
          }
        }
    }
    )
  }
}


module.exports = middlewarePlugin;
