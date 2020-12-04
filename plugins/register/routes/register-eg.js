const services = require('express-gateway/lib/services/')
var bodyParser = require('body-parser')
const superagent = require('superagent');
const axios = require('axios');
const mail = require("./mailer.config");
const { user } = require('express-gateway/lib/services/');

module.exports = function (gatewayExpressApp) {
  gatewayExpressApp.use(bodyParser.json())

  gatewayExpressApp.post('/api/register', async (req, res, next) => {
    try {
        console.log("*********************************",req.body)

        const {  firstname, lastname, email , phone , password, password_confirmation } = req.body
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
        const creteProfile = async (myUser) => {
          console.log("in create profile "+myUser.id)
          console.log("in create profile "+myUser.firstname)
          console.log("in create profile "+myUser.lastname)
          console.log("in create profile "+myUser.phone)

          try {
            return await axios.post('http://localhost:5000/api/profile', {
              id_user:  myUser.id,
              first_name: myUser.firstname,
              last_name: myUser.lastname,
              phone: myUser.phone,
              typeId: "1425d882-a03e-4ffc-b996-101233874443"
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
        const userProfile =  await creteProfile(myUser);
        console.log("eeeeeeeeeeeeeeee",userProfile);

        myProfile = await services.application.insert({
          name: "complete_profile"+myUser.id,
          redirectUri: 'http://localhost:5000/api/profile/'+userProfile.data.data.id
        },myUser.id)

        console.log("éazertt",userProfile.data)
        const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id="+myProfile.id+"&"+"redirect_uri="+myProfile.redirectUri  ;
        console.log("url confirm : "+ confirm_uri);
        mail.send_email("confirmation","confirmer votre profile ssvp \n "+ confirm_uri);

   

        return res.status(201).json({message:"Check your email : "+myUser.email});

    } catch (err) {
      return res.status(422).json({ error: err.message })
    }
  });

  gatewayExpressApp.post('/api/completed-register', async (req, res, next) => {
    try {

        const {  firstname, lastname, email , phone , password, password_confirmation,typeId,commercial,city,zip_code,adresse,id_commercial,activity } = req.body
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
        const creteProfile = async (myUser) => {
          
                  try {
            return await axios.post('http://localhost:5000/api/profile', {
              id_user:  myUser.id,
              first_name: myUser.firstname,
              last_name: myUser.lastname,
              phone: myUser.phone,
              typeId : typeId ,
              commercial : commercial,
              city : city ,
              zip_code : zip_code ,
              adresse : adresse , 
              id_commercial: id_commercial,
              activity : activity 
            })
          } catch (error) {
            console.error(error)
          }
        }
        crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
          autoGeneratePassword: false,
          password: password,
          scopes: ["admin"]  
        })
        //crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2')
        const userProfile =  await creteProfile(myUser);
      
        // myProfile = await services.application.insert({
        //   name: "complete_profile"+myUser.id,
        //   redirectUri: 'http://localhost:5000/api/profile/'+userProfile.data.data.id
        // },myUser.id)

        const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id="+myProfile.id+"&"+"redirect_uri="+myProfile.redirectUri  ;
        console.log("url confirm : "+ confirm_uri);
        mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);
        return res.status(201).json({user : myUser  , "profile" : userProfile});
        
    } catch (err) {
      return res.status(422).json({ error: err.message })
    }


  });

  



};
 