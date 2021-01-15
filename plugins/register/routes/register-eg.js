const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')

const superagent = require('superagent');
const axios = require('axios');
const mail = require("./mailer.config");
const { user } = require('express-gateway/lib/services/');
const CircularJSON = require('circular-json');
const bodyParser = require("body-parser");

// const oauth2orize = require('oauth2orize');
// const passport = require('passport');
// const login = require('connect-ensure-login');
// const path = require('path');

const config = require('express-gateway/lib/config/');
const tokenService = services.token;
const authService = services.auth;

const expiresIn = config.systemConfig.accessTokens.timeToExpiry / 1000;

module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.post('/register', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("*********************************", req.body)
      console.log("/register")

      const { firstname, lastname, email, phone, password, password_confirmation } = req.body
      if (password != password_confirmation) {
        throw new Error('password does not much')
      }

      myUser = await services.user.insert({
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: email,
        email: email,
        phone: phone,
        redirectUri: 'https://www.khallasli.com',
      })
      const getType = async (code) => {
        try {
          return await axios.get('http://localhost:5000/api/type_user/by_code/' + code)
        } catch (error) {
          console.error(error)
        }
      }

      const dataType = await getType("10");
      const creteProfile = async (myUser) => {
        try {
          return await axios.post('http://localhost:5000/api/profile', {
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
          console.error("111111111111111111111")
  return res.status(400).json("error",error);

        }
      }
 
      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: password,
        scopes: ['admin']
      })
      console.log("crd_basiiiiiiiiiiic",crd_basic)

      crd_jwt = await services.credential.insertCredential(myUser.id, 'jwt',{ scopes: ['admin'] })
      console.log("jjjjjjjjjjjjjjjjjwtttttttttt",crd_jwt)

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2',{ scopes: ['admin'] })
      console.log("crd_oauth222222222222",crd_oauth2)

      
      crd_keyAuth = await services.credential.insertCredential(myUser.id, 'key-auth', { scopes: ['admin'] })
      console.log("keyyyyyyyyyyyyyAkuuuuuth",crd_keyAuth)

      const userProfile = await creteProfile(myUser);

      if (userProfile.data.status == "error") {
        return res.status(200).json(userProfile.data);
      }

      // myProfile = await services.application.insert({
      //   name: "complete_profile" + myUser.id,
      //   redirectUri: 'http://localhost:5000/api/profile/'
      // }, myUser.id)

      // const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
      // console.log("url confirm : " + confirm_uri);
      // mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);
console.log("email",email)
console.log("password",password)

console.log("crd_oauth2.id",crd_oauth2.id)
console.log("crd_oauth2.secret",crd_oauth2.secret)
try {
console.log("email iciiiiiiiiiii")

  const token = await getToken(email,password,crd_oauth2.id,crd_oauth2.secret)
  console.log("Token ", token.data)
  return res.status(201).json(token.data);


} catch (error) {
  return res.status(400).json({ message: error });

}


      // return res.status(201).json({ apiKey: "apiKey " + crd_keyAuth.keyId + ":" + crd_keyAuth.keySecret });

      // return res.status(201).json({message:"Check your email : "+myUser.email});

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.patch('/complete_profile/:id', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("*********************************", req.body)
      console.log("/api/complete_profile")

      const { commercial_register, city, zip_code, adresse, activity } = req.body

      const updaterofile = async () => {
        try {
          return await axios.patch('http://localhost:5000/api/company/' + req.params.id, {
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
      const userProfile = await updaterofile();


      // mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);


      return res.status(201).json({ message: userProfile.data });

      // return res.status(201).json({message:"Check your email : "+myUser.email});

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.post('/agent-register', async (req, res, next) => { // code=20 for agent created by admin
    try {
      const { firstname, lastname, email, phone } = req.body
      console.log("/api/agent-register")
      agentUser = await services.user.insert({
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: email,
        email: email,
        phone: phone,
        redirectUri: 'https://www.khallasli.com',
      })
      //////////////
      const getType = async (code) => {
        try {
          return await axios.get('http://localhost:5000/api/type_user/by_code/' + code)
        } catch (error) {
          console.error(error)
        }
      }
      const dataType = await getType("20");
      /////////////

      const createAgentProfile = async (agentUser) => {

        try {
          return await axios.post('http://localhost:5000/api/profile/agent', {
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
      var randomPassword = Math.random().toString(36).slice(-8);
      console.log("randomPassword", randomPassword)
      crd_basic = await services.credential.insertCredential(agentUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: randomPassword,
        scopes: ["agent"]
      })
      crd_oauth2 = await services.credential.insertCredential(agentUser.id, 'oauth2')
      crd_keyAuth = await services.credential.insertCredential(myUser.id, 'key-auth', { scopes: ['agent'] })

      const userProfile = await createAgentProfile(agentUser);
      console.log("randomPassword", userProfile.response)

      if (userProfile.data.status == "error") {
        return res.status(200).json(userProfile.data);
      }

      myProfile = await services.application.insert({
        name: "complete_profile" + agentUser.id,
        redirectUri: 'http://localhost:5000/api/profile/' + userProfile.data.data.id
      }, agentUser.id)
      const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
      console.log("url confirm : " + confirm_uri);
      // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);

      return res.status(201).json({ message: "Check your email : " + agentUser.email + " confirmation Here your email and password : " + randomPassword + "\n" + "Click on this link to change your password \n " + confirm_uri });


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

  gatewayExpressApp.patch('/activate/:id', async (req, res, next) => {
    const { code } = req.body // code = 10 desactive , 11 active

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


  gatewayExpressApp.post('/admin-register', async (req, res, next) => { 
    try {
      console.log("/api/admin-register")

      const { firstname, lastname, email, phone, password, password_confirmation } = req.body
      if (password != password_confirmation) {
        throw new Error('password does not much')
      }

      myUser = await services.user.insert({
        isActive: true,
        firstname: firstname,
        lastname: lastname,
        username: email,
        email: email,
        phone: phone,
        redirectUri: 'https://www.khallasli.com',
      })

      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: password,
        scopes: ["admin"]
      })

      crd_keyAuth = await services.credential.insertCredential(myUser.id, 'key-auth', { scopes: ['admin'] })

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['admin'] })

      adminProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: 'http://localhost:5000/api/profile/' + myUser.id
      }, myUser.id)
      const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + adminProfile.id + "&" + "redirect_uri=" + adminProfile.redirectUri;
      console.log("url confirm : " + confirm_uri);

      return res.status(201).json({ message: "Admin has been successfuly created : " + myUser.email });

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });


  function verifyApiKey(req, res, next) {

    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      // const bearer = bearerHeader.split(' ');
      // const bearerToken = bearer[1];
      // req.token = bearerToken;
      req.Value = bearerHeader;
      req.Key = "Authorization";
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  }

  gatewayExpressApp.get('/api/login', async (req, res, next) => { // code=20 for agent created by admin
    console.log("*********************************", req.body)
    console.log("/api/login")

    const {username, password} = req.body

    myUser = await services.user.find(username)
    // myUserUpdte = await services.user.update(myUser.id,"firstname")

    if(myUser == false){
      return res.status(200).json({ error: "username does not exist" });
    
    }
    myCredBasic = await services.credential.getCredential(myUser.id,'basic-auth')

    console.log("myCredBasic ",myCredBasic)
    const passBooleanTrue = await utils.compareSaltAndHashed(password,myCredBasic.password)
    if(!passBooleanTrue){
      return res.status(200).json({ error: "Wrong password" });

    }
      // const userProfile = await createAgentProfile();
      // const json = CircularJSON.stringify(userProfile);
      // JSON.stringify(userProfile)
      // console.log("myUser myUser ",myUser)
      // console.log("myUserUpdte myUserUpdte ",myUserUpdte)

      // myCred = await services.credential.getCredentials(myUser.id,{ includePassword: true }) //work




      // myCreds = await services.credential.getCredential(myUser.id,'key-auth')



      
      // console.log("myCred utils.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaencrypt(myCred.secret) ",utils.decrypt("$2a$10$HnyZHd9mhqTMJ6slBwzKTuXBPwbH.v3mZ1e4q10d1mZx02wawM5q2"))
      // console.log("myCred utils.decrypt(myCred.secret) ",utils.decrypt(utils.encrypt("test")))

      // console.log("iciiiiiiiiiii ",utils.compareSaltAndHashed("test","$2a$10$HnyZHd9mhqTMJ6slBwzKTuXBPwbH.v3mZ1e4q10d1mZx02wawM5q2"))


      // console.log("myCredssss ",myCreds)
      myCredOauth = await services.credential.getCredential(myUser.id,'oauth2')
      myCredOauth = await services.credential.removeCredential(myCredOauth.id,'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2')
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
          
      // myUserKeyAuth = await services.auth.authenticateCredential(myUser.id ,password ,"key-auth" )
      // if(myUserKeyAuth == false){ //user has not key-auth credential
      // // return res.status(200).json(myUserKeyAuth);
      // console.log("myUser Keyauth ",myUserKeyAuth)

      // }
      // console.log("myUser Keyauth ",myUserKeyAuth)

      // // myUserJwt = await services.auth.authenticateCredential(myUser.id ,password ,"jwt" )
      // // myUserJwt = await services.token.createJWT(req.body)

      // myUserJwt = await services.auth.authenticateCredential(myUser.id ,password ,"oauth2" )
      // // myUserJwt = await services.token.createJWT(req.body)
      // console.log("myUserJwt",myUserJwt)
      // // console.log("myUser jwt ",myUserJwt)
      // // if(myUserJwt == false){ //user has not oauth2 credential
      // //   // return res.status(200).json(myUserJwt);
      // // console.log("myUser jwt ",myUserJwt)

      // //   }

      let name = "complete_profile"+myUser.id
      userApp = await services.application.find(name)
      const login_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + userApp.id + "&" + "redirect_uri=" + userApp.redirectUri;

      console.log("dataaaaaaaaaaaaa",login_uri)
      // console.log("responsezzzeeeeeeeeeee",token.response)
      // console.log("myUserJwttttttttttttt",token.status)

      myUserJwt = await services.token.createJWT(req.body)
      




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
    const refresh_token = req.body.refresh_token
    const test = await services.token.getTokenObject(refresh_token)
    console.log("test",test)
    return res.status(200).json(test);
  
 
  });

  gatewayExpressApp.post('/api/reset_password', async (req, res, next) => { // still 
 
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

  // server.exchange(oauth2orize.exchange.password((consumer, username, password, scopes, done) => {
  //   // Validate the consumer
  //   return authService.validateConsumer(consumer.id)
  //     .then(consumer => {
  //       console.log('222222222222')
  //       if (!consumer) return done(null, false);
  
  //       return authService.authenticateCredential(username, password, 'basic-auth');
  //     })
  //     .then(user => {
  //       if (!user) return done(null, false);
  
  //       return Promise.all([user, scopes ? authService.authorizeCredential(consumer.id, 'oauth2', scopes) : true]);
  //     })
  //     .then(([user, authorized]) => {
  //       if (!authorized) return done(null, false);
  
  //       const tokenCriteria = {
  //         consumerId: consumer.id,
  //         authenticatedUser: user.id
  //       };
  
  //       if (scopes) tokenCriteria.scopes = scopes;
  
  //       if (config.systemConfig.accessTokens.tokenType === 'jwt') {
  //         return tokenService
  //           .createJWT({ consumerId: consumer.id, scopes })
  //           .then(res => Promise.all([res, tokenService.save({ consumerId: consumer.id, scopes }, { refreshTokenOnly: true })]))
  //           .then(([res, token]) => done(null, res, token.refresh_token, { expires_in: expiresIn }))
  //           .catch(done);
  //       }
  
  //       return tokenService.findOrSave(tokenCriteria, { includeRefreshToken: true })
  //         .then(token => done(null, token.access_token, token.refresh_token, { expires_in: expiresIn }));
  //     })
  //     .catch(done);
  // }));

};






