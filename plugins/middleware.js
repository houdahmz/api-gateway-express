const os = require('os');
useragent = require('express-useragent');
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
         var isMobile = ua.isMobile
         console.log("isMobile",isMobile)

                if(body.user){
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