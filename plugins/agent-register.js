const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const axios = require('axios');
const services = require('express-gateway/lib/services/')
const utils = require('express-gateway/lib/services/utils')



// const oauth2orize = require('oauth2orize');
// const passport = require('passport');
// const login = require('connect-ensure-login');
// const path = require('path');


const agentRegisterPlugin = {
    schema: { $id: "./../config/models/schema.js" },
    version: '1.0.0',
    policies: ['plugin'],
    init: function (pluginContext) {
      pluginContext.registerPolicy({
        name: 'agent-register',
        policy: (params) => 
        async function(req,res,next){
            try {
                console.log("iciiiiiiiiii")
                console.log("iciiiireq.bodyiiiiii",req.body)

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
          
                // const createAgentProfile = async (agentUser) => {
          
                //   try {
                //     return await axios.post('http://localhost:5000/api/profile/agent', {
                //       id_user: agentUser.id,
                //       first_name: agentUser.firstname,
                //       last_name: agentUser.lastname,
                //       phone: agentUser.phone,
                //       typeId: dataType.data.data.id
                //     })
                //   } catch (error) {
                //     console.error(error)
                //   }
                // }
                var randomPassword = Math.random().toString(36).slice(-8);
                console.log("randomPassword", randomPassword)
                crd_basic = await services.credential.insertCredential(agentUser.id, 'basic-auth', {
                  autoGeneratePassword: false,
                  password: randomPassword,
                  scopes: []
                })
          
                crd_oauth2 = await services.credential.insertCredential(agentUser.id, 'oauth2',{ scopes: ['agent'] })
                // crd_keyAuth = await services.credential.insertCredential(myUser.id, 'key-auth', { scopes: ['agent'] })
                console.log("email",email)
                console.log("password",randomPassword)
                console.log("crd_oauth2.id",crd_oauth2.id)
                console.log("crd_oauth2.secret",crd_oauth2.secret)
                const body = {
                  id_user: agentUser.id,
                  first_name: agentUser.firstname,
                  last_name: agentUser.lastname,
                  phone: agentUser.phone,
                  typeId: dataType.data.data.id,
                  username: email,
                            password: randomPassword,
                            client_id: crd_oauth2.id,
                            client_secret: crd_oauth2.secret
                }
            // return res.status(201).json(body);
            req.body = body
 next()
                // const userProfile = await createAgentProfile(agentUser);
                // console.log("randomPassword", userProfile.response)
          
                // if (userProfile.data.status == "error") {
                //   return res.status(200).json(userProfile.data);
                // }
          
                // myProfile = await services.application.insert({
                //   name: "complete_profile" + agentUser.id,
                //   redirectUri: 'http://localhost:5000/api/profile/' + userProfile.data.data.id
                // }, agentUser.id)
          
            //     const getToken = async (username,password,client_id,client_secret) => {
            //       try {
            //         return await axios.post('http://localhost:8080/oauth2/token',{
            //           grant_type: "password",
            //           username: username,
            //           password: password,
            //           client_id: client_id,
            //           client_secret: client_secret
            //         })
            //       } catch (error) {
            //         console.error("111111111111111111111")
            // return res.status(400).json("error",error);
          
            //       }
            //     }


                // const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
                // console.log("url confirm : " + confirm_uri);
                // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);
          
                // return res.status(201).json({ message: "Check your email : " + agentUser.email + " confirmation Here your email and password : " + randomPassword + "\n" + "Click on this link to change your password \n " + confirm_uri });
          
        //   try {
        //     const token = await getToken(email,randomPassword,crd_oauth2.id,crd_oauth2.secret)
        //     console.log("Token ", token.data)
        //     // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);
        //     return res.status(201).json({ message: "Check your email : " + agentUser.email + " to set a new password " ,token:token.data });
          
          
        //   } catch (error) {
        //     return res.status(400).json({ message: error });
          
        //   }
          
          
              } catch (err) {
                return res.status(422).json({ error: err.message })
              }

          }          
        }
      )}    
    }

  
  module.exports = agentRegisterPlugin;