const os = require('os');
useragent = require('express-useragent');
const services = require('express-gateway/lib/services/')

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
         console.log("os.platform()",os.platform())
         console.log("os.release()",os.release())
         console.log("os.type()",os.type()); // "Windows_NT"

         var source = req.headers['user-agent']
         var ua = useragent.parse(source);
         console.log("ua",ua)
         console.log("ua.source",ua.source)

         var isMobile = ua.isMobile
         console.log("isMobile",isMobile)

                if(body.user){

                    let userUpdated = await services.user.update(req.body.user.consumerId, { ip: ip ,os: os.platform(),source: ua.source})
                    // userUpdated = await services.user.update(req.body.user.consumerId, { os: os.platform(),source: ua.source })
                    console.log("userUpdated",userUpdated)
                    console.log("req.device.type.toUpperCase()",req.device.type.toUpperCase())

                    const user = await services.user.findByUsernameOrId(req.body.user.consumerId)
                    console.log("user", user)
            

                console.log("body before",body)
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