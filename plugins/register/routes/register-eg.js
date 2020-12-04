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
        const getType = async (code) => {
          try {
            return await axios.get('http://localhost:5000/api/type_user/by_code/'+code)
          } catch (error) {
            console.error(error)
          }
        }
        
        const dataType =  await getType("10");
        const creteProfile = async (myUser) => {
          try {
            return await axios.post('http://localhost:5000/api/profile', {
              id_user:  myUser.id,
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
        const userProfile =  await creteProfile(myUser);

          if(userProfile.data.status == "error"){
        return res.status(200).json(userProfile.data);
          }

        myProfile = await services.application.insert({
          name: "complete_profile"+myUser.id,
          redirectUri: 'http://localhost:5000/api/profile/'+userProfile.data.data.id
        },myUser.id)

        const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id="+myProfile.id+"&"+"redirect_uri="+myProfile.redirectUri  ;
        console.log("url confirm : "+ confirm_uri);
        mail.send_email("confirmation","confirmer votre profile svp \n "+ confirm_uri);

   

        return res.status(201).json({message:"Check your email : "+myUser.email});

    } catch (err) {
      console.log('*************************************error', err);
      return res.status(422).json({ error: err.message })
    }


  });


  



};
 