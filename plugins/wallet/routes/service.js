const services = require('express-gateway/lib/services/')
const superagent = require('superagent');
const axios = require('axios');
const mail = require("./mailer.config");
const { user } = require('express-gateway/lib/services/');
const CircularJSON = require('circular-json');
const bodyParser = require("body-parser");


module.exports = function (gatewayExpressApp) {
  // gatewayExpressApp.use(bodyParser.json())
  gatewayExpressApp.use(bodyParser.json({ limit: '50mb', extended: true }));
  gatewayExpressApp.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  gatewayExpressApp.post('/service', async (req, res, next) => { // code=10 for pdv where he has /api/completed-register
    try {
      console.log("*********************************", req.body)
      console.log("/api/service")

      const { firstname, lastname, email, phone, password, password_confirmation } = req.body
      if (password != password_confirmation) {
        throw new Error('password does not much')
      }
      myService = await services.user.insert({
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
      crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
        autoGeneratePassword: false,
        password: password,
        scopes: []
      })

      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2')
      const userProfile = await creteProfile(myUser);

      if (userProfile.data.status == "error") {
        return res.status(200).json(userProfile.data);
      }

      myProfile = await services.application.insert({
        name: "complete_profile" + myUser.id,
        redirectUri: 'http://localhost:5000/api/profile/' + userProfile.data.data.id
      }, myUser.id)

      const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
      console.log("url confirm : " + confirm_uri);
      // mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);


      return res.status(201).json({ message: "Check your email : " + myUser.email + " confirmation Here your email and password : \n" + "Click on this link to change your password \n " + confirm_uri });

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


  gatewayExpressApp.get('/test', async (req, res, next) => { // code=20 for agent created by admin
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

    myUser = await services.user.find(username,password)
      // const userProfile = await createAgentProfile();
      // const json = CircularJSON.stringify(userProfile);
      // JSON.stringify(userProfile)

      // myUserKeyAuth = await services.auth.authenticateCredential(myUser.id ,password ,"key-auth" )
      // if(myUserKeyAuth == false){ //user has not key-auth credential
      // // return res.status(200).json(myUserKeyAuth);
      // console.log("myUser Keyauth ",myUserKeyAuth)

      // }

      // myUserJwt = await services.auth.authenticateCredential(myUser.id ,password ,"jwt" )
      // myUserJwt = await services.token.createJWT(req.body)

      // console.log("myUser jwt ",myUserJwt)
      // if(myUserJwt == false){ //user has not oauth2 credential
      //   // return res.status(200).json(myUserJwt);
      // console.log("myUser jwt ",myUserJwt)

      //   }
if(myUser == false){
  return res.status(200).json({ error: "username does not exist" });

}
      let name = "complete_profile"+myUser.id
      userApp = await services.application.find(name)
      const login_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + userApp.id + "&" + "redirect_uri=" + userApp.redirectUri;

  
      return res.status(200).json(login_uri);

  });
};






