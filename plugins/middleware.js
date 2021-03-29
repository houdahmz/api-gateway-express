const os = require('os');
useragent = require('express-useragent');
const services = require('express-gateway/lib/services/')
const { lookup } = require('geoip-lite');
const iplocate = require("node-iplocate");
var moment = require('moment');
var ipF = require("ip");


const middlewarePlugin = {
  schema: { $id: "./../config/models/schema.js" },
  version: '1.0.0',
  policies: ['plugin'],
  init: function (pluginContext) {
    pluginContext.registerPolicy({
      name: 'middleware',
      policy: (params) =>
        async function (req, res, next) {
          console.log("in middleware")
          try {
            console.log("icii",req.body)
            let body = req.body;
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
        let addr = ip.address()

          const results = await iplocate(addr) 
          console.log("results",results)


         var source = req.headers['user-agent']
         var ua = useragent.parse(source);
        //  console.log("ua",ua)
         console.log("ua.source",ua.source)

         var isMobile = ua.isMobile
         console.log("isMobile",isMobile)

         console.log("lookup(ip)",lookup(ip))
         console.log("lookup(ip)",lookup(ip))
        //  console.log("iplocate",iplocate(ip)); // location of the user

                if(body.user){

                    let userUpdated = await services.user.update(req.body.user.consumerId, { 
                        ip: addr ,
                        os: os.platform(),
                        source: ua.source,
                        country:results.country,
                        city:results.city,
                        latitude:results.latitude,
                        longitude:results.longitude,
                        // geoip: lookup(ip),
                        last_login: new Date().toString()
                    
                    })
                    // userUpdated = await services.user.update(req.body.user.consumerId, { os: os.platform(),source: ua.source })
                    console.log("userUpdated",userUpdated)
                    console.log("req.device.type.toUpperCase()",req.device.type.toUpperCase())

                    const user = await services.user.findByUsernameOrId(req.body.user.consumerId)
                    console.log("user", user)
            

                // console.log("body before",body)
                body.created_by = req.body.user.consumerId
                body.deleted_by = req.body.user.consumerId
                body.updated_by = req.body.user.consumerId
                
                body.createdBy = req.body.user.consumerId
                body.deletedBy = req.body.user.consumerId
                body.updatedBy = req.body.user.consumerId
                console.log("body after ",body)
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