const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const services = require('express-gateway/lib/services/')

const loginPlugin = {
    schema: { $id: "./../config/models/schema.js" },
    version: '1.0.0',
    policies: ['plugin'],
    init: function (pluginContext) {
      pluginContext.registerPolicy({
        name: 'login',
        policy: (params) => 
        async function(req,res,next){

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

      myCredOauth = await services.credential.getCredential(myUser.id,'oauth2')
      myCredOauth = await services.credential.removeCredential(myCredOauth.id,'oauth2')
      crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2')
      console.log("crd_oauth2 ",crd_oauth2)

// req.body = {
//     username: username,
//     password: password,
//     client_id: crd_oauth2.id,
//     client_secret: crd_oauth2.secret

// }
// next()
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

    //   let name = "complete_profile"+myUser.id
    //   userApp = await services.application.find(name)
    //   const login_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + userApp.id + "&" + "redirect_uri=" + userApp.redirectUri;

      console.log("dataaaaaaaaaaaaa",login_uri)
    //   return res.status(token.status).json(token.data);
      req.body = {
          status: token.status,
          message : token.data
      }
        next()
          }          
        }
      )}    
    }

  
  module.exports = loginPlugin;