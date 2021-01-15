const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const validateUserPlugin = {
    schema: { $id: "./../config/models/schema.js" },
    version: '1.0.0',
    policies: ['plugin'],
    init: function (pluginContext) {
      pluginContext.registerPolicy({
        name: 'validate-user',
        policy: (params) => 
        async function(req,res,next){
          const requestedId = req.params.companyId; 
          console.log("requestedId",requestedId)
          try{
            let token = (req.headers.authorization).replace("Bearer ", "");

        //     let filePath = path.resolve(__dirname, ('../keys/public.pem'));
        //   console.log("filePath",filePath)

        //     const secret = fs.readFileSync(filePath, 'utf8');
        //   console.log("secret",secret)

    let decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw',{ algorithms: ['HS256'] });
// try {
//     console.log("decode",decoded)
//     console.log("decode",decoded.scopes)

// } catch (error) {
//     console.log("error",error)
//     res.status(403).send(error);

    
// }
              if(decoded.scopes){
                if(decoded.scopes == 'admin'){
                  next();
                }
                else {
                    let errorObject = {message: 'Unauthorized Token.'}
                    console.log(errorObject);
                    res.status(403).send(errorObject);
                }
              }
            //   else{
            //     if(decoded.profile.company_entity_id==requestedId){
            //       next();
            //     }
            //     else{
            //         let errorObject = {message: 'Unauthorized Token.',reason: "Invalid company_Id."}
            //         console.log(errorObject);
            //         res.status(403).send(errorObject);
            //     }
            //   }
            
            }           
          catch(error){
            let errorObject = {message: 'Unauthorized Token.',reason: error.name}
            console.log(errorObject);
            res.status(403).send(errorObject);
          } 
          }          
        }
      )}    
    }

  
  module.exports = validateUserPlugin;