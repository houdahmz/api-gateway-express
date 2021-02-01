// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const path = require('path')
// const services = require('express-gateway/lib/services/')

// const validateUserPlugin = {
//   schema: { $id: "./../config/models/schema.js" },
//   version: '1.0.0',
//   policies: ['plugin'],
//   init: function (pluginContext) {
//     pluginContext.registerPolicy({
//       name: 'validate-user',
//       policy: (params) =>
//         async function (req, res, next) {
//           console.log("in validate-user",req.body)
//           const requestedId = req.params.companyId;
//           console.log("requestedId", requestedId)
//           try {
//             let token = (req.headers.authorization).replace("Bearer ", "");

//             //     let filePath = path.resolve(__dirname, ('../keys/public.pem'));
//             //   console.log("filePath",filePath)

//             //     const secret = fs.readFileSync(filePath, 'utf8');
//             //   console.log("secret",secret)

//             let decoded;
//             try {
//               decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw', { algorithms: ['HS256'] });
//               console.log("decode", decoded)

//             } catch (error) {
//               console.log("error", error)
//               res.status(403).send(error);
//             }

//             const myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
//             console.log("myCredOauth ", myCredOauth)

//             console.log("myCredOauth ", myCredOauth.scopes)

//             let endpointScopes;
//             if (req.egContext.apiEndpoint && req.egContext.apiEndpoint.scopes) {
//               endpointScopes = req.egContext.apiEndpoint.scopes;
//             }
//             console.log('endpointScopes', endpointScopes)
//             console.log("myCredOauth.scopes[0] == endpointScopes[0]",myCredOauth.scopes[0] == endpointScopes[0])
// try {
  
//   if (myCredOauth.scopes) {
//     if (myCredOauth.scopes[0] == endpointScopes[0]) {
//       // req.body = {userId: decoded.consumerId}
//       // console.log("req.body",req.body)
//       next();
//     }
//     else {
//       let errorObject = { message: 'Unauthorized Token' }
//       console.log(errorObject);
//       res.status(403).send(errorObject);
//     }
//   }
//   //   else{
//   //     if(decoded.profile.company_entity_id==requestedId){
//   //       next();
//   //     }
//   //     else{
//   //         let errorObject = {message: 'Unauthorized Token.',reason: "Invalid company_Id."}
//   //         console.log(errorObject);
//   //         res.status(403).send(errorObject);
//   //     }
//   //   }
//   // next()

// } catch (error) {
//   res.status(403).send(error);
  
// }           
//           }
//           catch (error) {
//             let errorObject = { message: 'Unauthorized Token', reason: error.name }
//             console.log(errorObject);
//             res.status(403).send(errorObject);
//           }
//         }
//     }
//     )
//   }
// }


// module.exports = validateUserPlugin;


const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const services = require('express-gateway/lib/services/')
const env = require("../config/env.config");

const validateUserPlugin = {
  schema: { $id: "./../config/models/schema.js" },
  version: '1.0.0',
  policies: ['plugin'],
  init: function (pluginContext) {
    pluginContext.registerPolicy({
      name: 'validate-user',
      policy: (params) =>
        async function (req, res, next) {
          console.log("in validate-user")
//           console.log("in headers-user",req.headers)
//           console.log("in authorization",req.headers.authorization)

// next()
          // const requestedId = req.params.companyId;
          // console.log("requestedId", requestedId)
          try {
            let token = (req.headers.authorization).replace("Bearer ", "");

            //     let filePath = path.resolve(__dirname, ('../keys/public.pem'));
            //   console.log("filePath",filePath)

            //     const secret = fs.readFileSync(filePath, 'utf8');
            //   console.log("secret",secret)

            let decoded;
            try {
              decoded = await jwt.verify(token, `${env.JWT_SECRET}`, { algorithms: ['HS256'] });
              // console.log("decode", decoded)

            } catch (error) {
              console.log("error", error)
              res.status(403).send(error);
            }

            const myCredOauth = await services.credential.getCredential(decoded.consumerId, 'oauth2')
            console.log("myCredOauth ", myCredOauth)

            console.log("myCredOauth ", myCredOauth.scopes)

            let endpointScopes;
            if (req.egContext.apiEndpoint && req.egContext.apiEndpoint.scopes) {
              endpointScopes = req.egContext.apiEndpoint.scopes;
            }
            console.log('endpointScopes', endpointScopes)
try {

  if (myCredOauth.scopes) {
    let boolean = 0 ;
    for (let index = 0; index < endpointScopes.length; index++) {
      const element = endpointScopes[index];
      console.log("index",index)
      console.log("element",element)

      if (myCredOauth.scopes[0] == element ) {
        index = endpointScopes.length -1
        boolean = 1;
        next();
      }
  
    }
    if (boolean == 0 ) {
      let errorObject = { message: 'Unauthorized Token' }
      console.log(errorObject);
      res.status(403).send(errorObject);
      }


    // if (myCredOauth.scopes[0] == endpointScopes[0]) {
    //   // req.body = {userId: decoded.consumerId}
    //   // console.log("req.body",req.body)
    //   next();
    // }

    // else {
    //   let errorObject = { message: 'Unauthorized Token' }
    //   console.log(errorObject);
    //   res.status(403).send(errorObject);
    // }
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
  // next()

} catch (error) {
  res.status(403).send(error);
  
}           
          }
          catch (error) {
            let errorObject = { message: 'Unauthorized Token', reason: error.name }
            console.log(errorObject);
            res.status(403).send(errorObject);
          }
        }
    }
    )
  }
}


module.exports = validateUserPlugin;