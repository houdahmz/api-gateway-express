const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')

const superagent = require('superagent');
const axios = require('axios');
const mail = require("./mailer.config");
const { user } = require('express-gateway/lib/services/');
const CircularJSON = require('circular-json');

const jwt = require('jsonwebtoken');

// const oauth2orize = require('oauth2orize');
// const passport = require('passport');
// const login = require('connect-ensure-login');
// const path = require('path');

const config = require('express-gateway/lib/config/');
const tokenService = services.token;
const authService = services.auth;

const expiresIn = config.systemConfig.accessTokens.timeToExpiry / 1000;
// const bodyParser = require("body-parser");
const express = require('express');
const jsonParser = require('express').json();
const urlEncodedParser = require("express").urlencoded({ extended: true });
const { PassThrough } = require("stream");

const bodyParser = require("body-parser");
const app = express();

require("body-parser").urlencoded({ limit: "50mb", extended: true }),
require("body-parser").json({ limit: "50mb", extended: true }),
require("express").json({ limit: "50mb", extended: true }), //-- use express.json
require("express").urlencoded({ limit: "50mb", extended: true }), //-- use express.urlencoded

module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.post('/register', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("*********************************", req.body)
      console.log("/register")

      const { firstname, username, lastname, email, phone, password, password_confirmation } = req.body
      if (password != password_confirmation) {
        throw new Error('password does not much')
      }
     const myUserJwt = await jwt.sign({username:username,password:password},  '54v3WJGBcFPh3TFgZSzovw', {
            issuer: 'express-gateway',
            audience: 'something',
            expiresIn: 18000,
            subject: '3pXQjeklS3cFf8OCJw9B22',
            algorithm: 'HS256' 
          });
       
      console.log("myUserJwt",myUserJwt)

      // const confirm_token = Math.random().toString(36).substring(2, 40) + Math.random().toString(36).substring(2, 40);
      myUser = await services.user.insert({
        isActive: false,
        confirmMail: false,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        redirectUri: 'https://www.khallasli.com',
        confirm_token: myUserJwt
      })
      const getType = async (code) => {
        try {
          return await axios.get('http://localhost:3000/api_management/user_management/type_user/by_code/' + code)
        } catch (error) {
          console.error(error)
        }
      }
      console.log("myUser",myUser)
      
      const dataType = await getType("10");
      const creteProfile = async (myUser) => {
        try {
          return await axios.post('http://localhost:3000/api_management/user_management/profile', {
            id_user: myUser.id,
            first_name: myUser.firstname,
            last_name: myUser.lastname,
            phone: myUser.phone,
            typeId: dataType.data.data.id
          })
        } catch (error) {
          console.error(error)
        }
      }


      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: password,
        scopes: []
      })
      console.log("crd_basiiiiiiiiiiic",crd_basic)

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2',{ scopes: ['user'] })
      console.log("crd_oauth222222222222",crd_oauth2)

      
      const userProfile = await creteProfile(myUser);
      if (userProfile.data.status == "error") {
        return res.status(200).json(userProfile.data);
      }

      myProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: 'http://localhost:5000/api/profile/'
      }, myUser.id)

console.log("email",username)
console.log("password",password)
console.log("crd_oauth2.id",crd_oauth2.id)
console.log("crd_oauth2.secret",crd_oauth2.secret)

  const confirm_uri = "http://localhost:8080/registration_confirm?username=" + username + "&" + "confirm_token=" + myUserJwt;
  console.log("confirm_uri",confirm_uri)
  //here je vais envoyer un mail

   mail.send_email("confirmation","Veuillez cliquer sur lien pour activer votre compte \n "+ confirm_uri);

  return res.status(201).json({etat: "Success",message:"Check your email : " + email});
    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.post('/registration_confirm', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("/registration_confirm")
      const { username, confirm_token } = req.query
      const user = await services.user.findByUsernameOrId(username)
      console.log("user", user)

      console.debug('confirmation', user, req.query, confirm_token, username)
      if (user == false) { // username does not exist
        console.debug('wrong confirmation token')
        return res.status(200).json({ error: "wrong confirmation token" });
      }

    myCredBasic = await services.credential.getCredential(user.id,'basic-auth')
    console.log("myCredBasic", myCredBasic)

      let decoded;
      try {
        decoded = await jwt.verify(confirm_token, '54v3WJGBcFPh3TFgZSzovw', { algorithms: ['HS256'] });
        console.log("decoded", decoded)

        if(!decoded){
          console.debug('wrong confirmation token')
          return res.status(200).json({ error: "wrong confirmation token" });

        }else{
          if(user.username != decoded.username){
            console.debug('wrong confirmation token')
            return res.status(200).json({ error: "wrong confirmation token" });

            }
          const passBooleanTrue = await utils.compareSaltAndHashed(decoded.password,myCredBasic.password)
          if(!passBooleanTrue){
            return res.status(200).json({ error: "wrong confirmation token" });
      
          }
        }
      } catch (error) {
        console.log("error", error)
        // res.status(403).send(error);
        return res.status(400).json({ error: error });
      }
      // user_res = await services.user.activate(user.id)
      console.log("user_res")

      user_res = await services.user.update(user.id,{confirmMail: 'true'})

      console.log("user_res",user_res)
      // user = await services.user.findByUsernameOrId(email)
      return res.status(200).json({ etat: "Success" });

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });


  gatewayExpressApp.patch('/complete_profile/:id', verifyTokenUser, async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("/api/complete_profile")
if(!req.params.id){
  console.log("*********************************", req.body)
  return res.status(200).json({ error: "Id can not be empty" })

}
    // myUser = await services.user.get(req.params.id)

    //   if(myUser == false){
    //     return res.status(200).json({ error: "id does not exist" });
      
    //   }else if (myUser.isActive == false){
    //     return res.status(200).json({ error: "user is desactivated" });
  
    //   }
      const { commercial_register, city, zip_code, adresse, activity } = req.body

      const updateprofile = async () => {
        try {
          return await axios.patch('http://localhost:3000/api_management/user_management/company/' + req.params.id, {
            commercial_register: commercial_register,
            city: city,
            zip_code: zip_code,
            adresse: adresse,
            activity: activity
          })
        } catch (error) {
          console.error(error)
        }
      }
      const userProfile = await updateprofile();


      // mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);


      return res.status(200).json({ message: userProfile.data });

      // return res.status(201).json({message:"Check your email : "+myUser.email});

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.post('/agent_register',verifyTokenUser,async (req, res, next) => { // incomplete {add send mail with url /change_password} 
  try {
    const { firstname, username, lastname, email, phone,idOwner } = req.body
    console.log("/api/agent-register")


    agentUser = await services.user.insert({
      isActive: true,
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      phone: phone,
      redirectUri: 'https://www.khallasli.com',
    })
    // //////////////
    // const getType = async (code) => {
    //   try {
    //     return await axios.get('http://localhost:3000/api_management/user_management/type_user/by_code/' + code)
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const dataType = await getType("20");
    // /////////////

    const createAgentProfile = async (agentUser) => {

      try {
        return await axios.post('http://localhost:3000/api_management/user_management/company/profile-by-company', { ///profile-by-company
          idOwner: idOwner,
          id_user: agentUser.id,
          first_name: agentUser.firstname,
          last_name: agentUser.lastname,
          phone: agentUser.phone
        })
      } catch (error) {
        console.error(error)
      }
    }
    var randomPassword = Math.random().toString(36).slice(-8);
    console.log("randomPassword", randomPassword)
    console.log("agentUser", agentUser)

    crd_basic = await services.credential.insertCredential(agentUser.id, 'basic-auth', {
      autoGeneratePassword: false,
      password: randomPassword,
      scopes: []
    })

    // crd_oauth2 = await services.credential.insertCredential(agentUser.id, 'oauth2', { scopes: ['agent'] } )
    // console.log("crd_oauth2",crd_oauth2)
    // crd_keyAuth = await services.credential.insertCredential(myUser.id, 'key-auth', { scopes: ['agent'] })

    crd_oauth2 = await services.credential.insertCredential(agentUser.id, 'oauth2',{ scopes: ['agent'] })
    console.log("crd_oauth222222222222",crd_oauth2)


    console.log("email",email)
    console.log("password",randomPassword)
    console.log("crd_oauth2.id",crd_oauth2.id)
    console.log("crd_oauth2.secret",crd_oauth2.secret)
    
    const userProfile = await createAgentProfile(agentUser);
   console.log("zzz",userProfile.data)
    if (userProfile.data.status == "error") {
      return res.status(200).json(userProfile.data);
    }

    // myProfile = await services.application.insert({
    //   name: "complete_profile" + agentUser.id,
    //   redirectUri: 'http://localhost:5000/api/profile/' + userProfile.data.data.id
    // }, agentUser.id)


    // const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
    // console.log("url confirm : " + confirm_uri);
    // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);

    // return res.status(201).json({ message: "Check your email : " + agentUser.email + " confirmation Here your email and password : " + randomPassword + "\n" + "Click on this link to change your password \n " + confirm_uri });


//// token      
//       const getToken = async (username,password,client_id,client_secret) => {
//         try {
//           return await axios.post('http://localhost:8080/oauth2/token',{
//             grant_type: "password",
//             username: username,
//             password: password,
//             client_id: client_id,
//             client_secret: client_secret
//           })
//         } catch (error) {
//           console.error("111111111111111111111")
//   return res.status(400).json("error",error);

//         }
//       }
// try {
//   const token = await getToken(username,randomPassword,crd_oauth2.id,crd_oauth2.secret)
//   console.log("Token ", token.data)
//   // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);
//   return res.status(201).json({ message: "Check your email : " + agentUser.email + " to set a new password " ,token: token.data });


// } catch (error) {
//   return res.status(400).json({ message: error });

// }

mail.send_email("Reset password","Veuillez cliquer sur lien pour changer le mot de passe (password: "+ randomPassword + " )");

return res.status(201).json({ etat: "Success",message: "We have sent an email to " + agentUser.email + " to set a new password" });


  } catch (err) {
    return res.status(422).json({ error: err.message })
  }



  });


  gatewayExpressApp.get('/test', async (req, res, next) => {
    try {
      const createAgentProfile = async () => {
        try {

          let config = {
            headers: { Authorization: `Bearer ${req.header('authorization')}` }
          }
          return await axios.get('http://localhost:5000/api/profile')
        } catch (error) {
          console.error(error)
        }
      }

      const userProfile = await createAgentProfile();
      const json = CircularJSON.stringify(userProfile);
      // JSON.stringify(userProfile)
      return res.status(200).json(JSON.stringify(userProfile));

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.patch('/activate/:id', verifyTokenSuperAdminOrAdmin, async (req, res, next) => {
    const { code } = req.body // code = 10 desactive , 11 active
    if (!code){
      return res.status(200).json({error : "Code can not be empty (set 10 to desactivate or 11 to activate a user"});

    }
    if ( code == 10) {
      myUser = await services.user.deactivate(req.params.id)
      if (myUser == true){
        return res.status(200).json({message : "The user has been desactivated"});
      }

    } else if ( code == 11) {
      myUser = await services.user.activate(req.params.id)
      if (myUser == true){
        return res.status(200).json({message : "The user has been activated"});
      }
    }

  });


  gatewayExpressApp.post('/admin_register', verifyTokenSuperAdmin, async (req, res, next) => { 
    try {
      console.log("/api/admin-register")

      const { firstname,username, lastname, email, phone } = req.body

      myUser = await services.user.insert({
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        phone: phone,
        redirectUri: 'https://www.khallasli.com',
      })
      ////////////
      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)


      //////////////
      const getType = async (code) => {
        try {
          return await axios.get('http://localhost:3000/api_management/user_management/type_user/by_code/' + code)
        } catch (error) {
          console.error(error)
        }
      }
      const dataType = await getType("20");
      /////////////

      const createAgentProfile = async (agentUser) => {

        try {
          return await axios.post('http://localhost:3000/api_management/user_management/profile/agent', {
            id_user: agentUser.id,
            first_name: agentUser.firstname,
            last_name: agentUser.lastname,
            phone: agentUser.phone,
            typeId: dataType.data.data.id
          })
        } catch (error) {
          console.error(error)
        }
      }
      //////////////

      const userProfile = await createAgentProfile(myUser);

      if (userProfile.data.status == "error") {
        return res.status(200).json(userProfile.data);
      }


      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: randomPassword,
        scopes: []
      })
      console.log("crd_basiiiiiiiiiiic",crd_basic)

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2',{ scopes: ['admin'] })
      console.log("crd_oauth222222222222",crd_oauth2)
      console.log("email",email)
      console.log("password",randomPassword)
      console.log("crd_oauth2.id",crd_oauth2.id)
      console.log("crd_oauth2.secret",crd_oauth2.secret)

      mail.send_email("Reset password","Veuillez cliquer sur lien pour changer le mot de passe (password: "+ randomPassword + " )");

      return res.status(201).json({ etat: "Success",message: "Admin has been successfuly created, we have sent an email to " + email + " to set a new password" });


    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  async function verifyTokenUser(req, res, next) {
 
    const bearerHeader = req.headers['authorization'];

if(bearerHeader) {   

  try{
    let token = (req.headers.authorization).replace("Bearer ", "");
    let decoded;
try {
  decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw',{ algorithms: ['HS256'] });
console.log("decode",decoded.consumerId)

} catch (error) {
console.log("error",error)
res.status(403).send(error);
}
let myCredOauth;
try {
myCredOauth = await services.credential.getCredential(decoded.consumerId,'oauth2')
console.log("myCredOauth",myCredOauth)
  
} catch (error) {
console.log("error",error)
  
}

console.log("myCredOauth",myCredOauth.scopes)

let endpointScopes = "user";

        if(myCredOauth.scopes){
          if(myCredOauth.scopes[0] == endpointScopes){
            next();
          }
          else {
              let errorObject = {message: 'Unauthorized Token. cannot'}
              console.log(errorObject);
              res.status(403).send(errorObject);
          }
        }
      }           
    catch(error){
      let errorObject = {message: 'Unauthorized Token.',reason: error.name}
      console.log(errorObject);
      res.status(403).send(errorObject);
    } 
  
  }else {
          // Forbidden
      res.sendStatus(403)
  }


  }

  async function verifyTokenAdmin(req, res, next) {
    const bearerHeader = req.headers['authorization'];

if(bearerHeader) {   

  try{
    let token = (req.headers.authorization).replace("Bearer ", "");
    let decoded;
try {
  decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw',{ algorithms: ['HS256'] });
console.log("decode",decoded.consumerId)

} catch (error) {
console.log("error",error)
res.status(403).send(error);
}
let myCredOauth;
try {
myCredOauth = await services.credential.getCredential(decoded.consumerId,'oauth2')
console.log("myCredOauth",myCredOauth)
  
} catch (error) {
console.log("error",error)
  
}

console.log("myCredOauth",myCredOauth.scopes)

let endpointScopes = "admin";

        if(myCredOauth.scopes){
          if(myCredOauth.scopes[0] == endpointScopes){
            next();
          }
          else {
              let errorObject = {message: 'Unauthorized Token. cannot'}
              console.log(errorObject);
              res.status(403).send(errorObject);
          }
        }
      }           
    catch(error){
      let errorObject = {message: 'Unauthorized Token.',reason: error.name}
      console.log(errorObject);
      res.status(403).send(errorObject);
    } 
  
  }else {
          // Forbidden
      res.sendStatus(403)
  }


  }

  async function verifyTokenSuperAdmin(req, res, next) {
    const bearerHeader = req.headers['authorization'];

if(bearerHeader) {   

  try{
    let token = (req.headers.authorization).replace("Bearer ", "");
    let decoded;
try {
  decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw',{ algorithms: ['HS256'] });
console.log("decode",decoded.consumerId)

} catch (error) {
console.log("error",error)
res.status(403).send(error);
}
let myCredOauth;
try {
myCredOauth = await services.credential.getCredential(decoded.consumerId,'oauth2')
} catch (error) {
console.log("error",error)
  
}

console.log("myCredOauth",myCredOauth.scopes)

let endpointScopes = "super_admin";

        if(myCredOauth.scopes){
          if(myCredOauth.scopes[0] == endpointScopes){
            next();
          }
          else {
              let errorObject = {message: 'Unauthorized Token. cannot'}
              console.log(errorObject);
              res.status(403).send(errorObject);
          }
        }
      }           
    catch(error){
      let errorObject = {message: 'Unauthorized Token.',reason: error.name}
      console.log(errorObject);
      res.status(403).send(errorObject);
    } 
  
  }else {
          // Forbidden
      res.sendStatus(403)
  }


  }

  async function verifyTokenSuperAdminOrAdmin(req, res, next) {

    const bearerHeader = req.headers['authorization'];

if(bearerHeader) {   

  try{
    let token = (req.headers.authorization).replace("Bearer ", "");
    let decoded;
try {
  decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw',{ algorithms: ['HS256'] });
console.log("decode",decoded.consumerId)

} catch (error) {
console.log("error",error)
res.status(403).send(error);
}
let myCredOauth;
try {
myCredOauth = await services.credential.getCredential(decoded.consumerId,'oauth2')
} catch (error) {
console.log("error",error)
  
}

console.log("myCredOauth",myCredOauth.scopes)

        if(myCredOauth.scopes){

          if(myCredOauth.scopes[0] == "super_admin" || myCredOauth.scopes[0] == "admin"){
            next();
          }
          else {
              let errorObject = {message: 'Unauthorized Token. cannot'}
              console.log(errorObject);
              res.status(403).send(errorObject);
          }
        }
      }           
    catch(error){
      let errorObject = {message: 'Unauthorized Token.',reason: error.name}
      console.log(errorObject);
      res.status(403).send(errorObject);
    } 
  
  }else {
          // Forbidden
      res.sendStatus(403)
  }


  }

  gatewayExpressApp.post('/api/login', async (req, res, next) => { // code=20 for agent created by admin
    console.log("*********************************", req.body)
    console.log("/api/login")

    const {username, password} = req.body

    myUser = await services.user.find(username)
    console.log("myUser",myUser)
    // myUserUpdte = await services.user.update(myUser.id,"firstname")
    if(myUser.confirmMail == 'false'){
      return res.status(200).json({ error: "Confirm your email" });
    
    }
    if(myUser == false){
      return res.status(200).json({ error: "username does not exist" });
    
    }else if (myUser.isActive == false){
      return res.status(200).json({ error: "user is desactivated" });

    }
    myCredBasic = await services.credential.getCredential(myUser.id,'basic-auth')

    console.log("myCredBasic ",myCredBasic)
    const passBooleanTrue = await utils.compareSaltAndHashed(password,myCredBasic.password)
    if(!passBooleanTrue){
      return res.status(200).json({ error: "Wrong password" });

    }

      myCredOauth = await services.credential.getCredential(myUser.id,'oauth2')
      let scope = myCredOauth.scopes;
      console.log("scope",scope)
      myCredOauth = await services.credential.removeCredential(myCredOauth.id,'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2',{ scopes: scope })
      console.log("crd_oauth2 ",crd_oauth2)


      const getToken = async (username,password,client_id,client_secret) => {
        try {
          return await axios.post('http://localhost:8080/oauth2/token',{
            grant_type: "password",
            username: username,
            password: password,
            client_id: client_id,
            client_secret: client_secret
          })
        } catch (error) {
          console.error(error)
        }
      }
 // here should get the token and applique invoke before generating a new one
      const token = await getToken(username,password,crd_oauth2.id,crd_oauth2.secret) 

      ///////////

          const getProfile = async (id) => {
            try {
              return await axios.get('http://localhost:3000/api_management/user_management/profile/by_userId/'+id)
            } catch (error) {
              console.error(error)
            }
          }
          ///////////
  // var data = await getProfile(myUser.id) 
  // console.log("datassssssssssss",data)

   var data ;
try {
   data = await getProfile(myUser.id) 
  
} catch (error) {
  console.log("error",error)
}
      let name = "complete_profile"+myUser.id
      userApp = await services.application.find(name)
      const login_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + userApp.id + "&" + "redirect_uri=" + userApp.redirectUri;

      console.log("dataaaaaaaaaaaaa",login_uri)
      // console.log("responsezzzeeeeeeeeeee",token.response)
      // console.log("myUserJwttttttttttttt",token.status)
      // myUserJwt = await services.token.createJWT(req.body)
      

      // console.log("dataaaaaaaaaaaaa",data.status)

          if(token.status == 200){
            if(data.status == 200){
              return res.status(token.status).json({token: token.data,data: data.data.data});
            }

          }


      return res.status(token.status).json(token.data);

// myUserT = await services.user.find(username,password)

// console.log("id",myUserT)
// // myUser = await services.token.createJWT({username: req.body.username, password: req.body.password,sub:'1e4cGO1lbBroJNJoapHCmo'})

// myUser = await services.token.createJWT({username: 'hh10@gmail.com', password: 'test',sub:'1e4cGO1lbBroJNJoapHCmo'})
// // myUser = await services.auth.authenticateCredential('3m1IH3vnrswtN7OWHjtp5a','4VCrWbGAIfpcMKHY0tOl5M','key-auth')

// // myUser = await services.auth.authenticateCredential('3m1IH3vnrswtN7OWHjtp5a','4VCrWbGAIfpcMKHY0tOl5M','key-auth')

//     // myUser = await services.token.getTokensByConsumer(myUserT.id)
//       return res.status(200).json(myUser);


  });

  gatewayExpressApp.get('/api/logout', async (req, res, next) => { // still incomplete
  console.log('heere',req.headers.authorization)
    const test = await services.token.getTokenObject(req.headers.authorization)
  
    return res.status(200).json(test);
 
  });

  gatewayExpressApp.post('/api/refreshToken', async (req, res, next) => { // still incomplete
    const { client_id, refresh_token } = req.body

    myCredOauth = await services.credential.getCredential(client_id,'oauth2')
    myCredOauth = await services.credential.removeCredential(myCredOauth.id,'oauth2')
    crd_oauth2 = await services.credential.insertCredential(client_id, 'oauth2')
    console.log("crd_oauth2 ",crd_oauth2)

    const getRefreshToken = async (client_id, client_secret, refresh_token) => {
      try {
        return await axios.post('http://localhost:8080/oauth2/token',{
          grant_type: "refresh_token",
          refresh_token: refresh_token,
          client_id: client_id,
          client_secret: client_secret
        })
      } catch (error) {
        console.error("error")
return res.status(400).json("error",error);

      }
    }
    // const refresh_token = getRefreshToken(client_id,crd_oauth2.secret,refresh_token)

    // const refresh_token = req.body.refresh_token
    const test = await services.token.getTokenObject(refresh_token)
    console.log("test",test)
    return res.status(200).json(test);
  
 
  });

  gatewayExpressApp.post('/forgot', async (req, res, next) => { //get email from user change to email
    const username = req.body.username
    const user = await services.user.findByUsernameOrId(username)
    console.log("user", user)
    console.debug('confirmation', user, username)
    if (user == false) { // username does not exist
      console.debug('Username does not exist')
      return res.status(200).json({ error: "Username does not exist" });
    }

    const myUserJwt = await jwt.sign({username:username},  '54v3WJGBcFPh3TFgZSzovw', {
      issuer: 'express-gateway',
      audience: 'something',
      expiresIn: 18000,
      subject: '3pXQjeklS3cFf8OCJw9B22',
      algorithm: 'HS256' 
    });
    console.log("aaa",myUserJwt)

    const confirm_uri = "http://localhost:8080/reset?username=" + username + "&" + "token=" + myUserJwt;
    console.log("confirm_uri",confirm_uri)
    //here je vais envoyer un mail
  
     mail.send_email("Reset password","Veuillez cliquer sur lien pour changer le mot de passe "+ confirm_uri +" \n Link valable pour 5 heures");
  
    return res.status(201).json({etat: "Success",message:"Check your email : " + user.email});
  


  });

  gatewayExpressApp.post('/reset', async (req, res, done) => {  

    try {
      console.log("/reset")
      const { username, token } = req.query
      const { password, password_confirmation } = req.body
console.log("dddd",password)
      const user = await services.user.findByUsernameOrId(username)
      console.log("user", user)

      console.debug('confirmation', user, req.query, token, username)
      if (user == false) { // username does not exist
        console.debug('wrong confirmation token')
        return res.status(200).json({ error: "wrong confirmation token" });
      }

    let myCredBasicA = await services.credential.getCredential(user.id,'basic-auth')
    console.log("myCredBasicssssssss", myCredBasicA)

      let decoded;
      try {
        decoded = await jwt.verify(token, '54v3WJGBcFPh3TFgZSzovw', { algorithms: ['HS256'] });
        console.log("decoded", decoded)

        if(!decoded){
          console.debug('wrong confirmation token')
          return res.status(200).json({ error: "wrong confirmation token" });

        }else{
          if(user.username != decoded.username){
            console.debug('wrong confirmation token')
            return res.status(200).json({ error: "wrong confirmation token" });

            }

            if (password != password_confirmation) {
            return res.status(200).json({ error: "password does not much" });
            }

            console.log("ddd")
        }
      } catch (error) {
        console.log("error", error)
        // res.status(403).send(error);
        return res.status(400).json({ error: error });

      }

     let myCredBasic = await services.credential.removeCredential(user.id,'basic-auth')
         myCredBasic = await services.credential.getCredential(user.id,'basic-auth')

    const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
      autoGeneratePassword: false,
      password: password,
      scopes: []
    })

      myCredBasic = await services.credential.getCredential(user.id,'basic-auth')
      console.log("sssssssssssssss", myCredBasic)
  
      const passBooleanTrue = await utils.compareSaltAndHashed(password,myCredBasic.password)
      if(!passBooleanTrue){
        return res.status(200).json({ error: "wrong confirmation token" });
      }


      // const usert = await services.user.findByUsernameOrId(username)
      // console.log("user",usert)

      // user = await services.user.findByUsernameOrId(email)
      return res.status(200).json({ etat: "Success" });

      // res.redirect(process.env.FRONTEND_URL + '/signup/activated')

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }

  });

  gatewayExpressApp.post('/api/test_password', async (req, res, done) => { // still 

    const validateConsumer = await  authService.validateConsumer(req.body.consumerId) ;
    const user = await authService.authenticateCredential(req.body.username, req.body.password, 'basic-auth');
    const createJWT = await tokenService.createJWT({ consumerId: req.body.consumerId, scopes:req.body.scopes })
    const saveJWT = await tokenService.save({ consumerId: req.body.consumerId, scopes:req.body.scopes }, { refreshTokenOnly: true })
    const tokenCriteria = {
        consumerId: req.body.consumerId,
        authenticatedUser: user.id
      };
    const token = await tokenService.findOrSave(tokenCriteria, { includeRefreshToken: true })

console.log("validateConsumer",validateConsumer)
console.log("user",user)
console.log("createJWT",createJWT)
console.log("saveJWT",saveJWT)
console.log("findOrSaveJWT",token)
console.log("findOrSaveJWT",token)
// config.systemConfig.accessTokens.tokenType


return res.status(200).json("token");


  //  return authService.validateConsumer(req.body.consumerId)
  //   .then(consumer => {
  //     console.log('111111111111',consumer)
  //     if (!consumer) return done(null, false);

  //     return authService.authenticateCredential(req.body.username, req.body.password, 'basic-auth');
  //   })
  //   .then(user => {
  //     console.log('222222222222',user)

  //     if (!user) return done(null, false);

  //     return Promise.all([user, req.body.scopes ? authService.authorizeCredential(req.body.consumerId, 'oauth2', req.body.scopes) : true]);
  //   })
  //   .then(([user, authorized]) => {
  //     if (!authorized) return done(null, false);

  //     const tokenCriteria = {
  //       consumerId: req.body.consumerId,
  //       authenticatedUser: user.id
  //     };

  //     if (req.body.scopes) tokenCriteria.scopes = req.body.scopes;

  //     if (config.systemConfig.accessTokens.tokenType === 'jwt') {
  //       return tokenService
  //         .createJWT({ consumerId: req.body.consumerId, scopes:req.body.scopes })
  //         .then(res => Promise.all([res, tokenService.save({ consumerId: req.body.consumerId, scopes:req.body.scopes }, { refreshTokenOnly: true })]))
  //         .then(([res, token]) => done(null, res, token.refresh_token, { expires_in: expiresIn }))
  //         .catch(done);
  //     }

  //     return tokenService.findOrSave(tokenCriteria, { includeRefreshToken: true })
  //       .then(token => done(null, token.access_token, token.refresh_token, { expires_in: expiresIn }));
  //   })
  //   .catch(done);

 
  });

};
