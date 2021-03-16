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