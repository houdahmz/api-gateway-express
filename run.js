const env = require("./config/env.config");
const services = require('express-gateway/lib/services/')


exports.initiate = async () => {

    myUserExist = await services.user.find(env.USERADMIN)
    // myUserUpdte = await services.user.update(myUser.id,"firstname")

    if (myUserExist == false) { //if admin does not exist
    console.log("env.USERADMIN", env.USERADMIN)
    console.log("env.PASSWORD", env.PASSWORD)
    console.log("env.EMAIL", env.EMAIL)
    console.log("env.PHONE", env.PHONE)


        myUser = await services.user.insert({
            isActive: true,
            confirmMail: true,
            profilCompleted: true,
            firstname: "paypos",
            lastname: "paypos",
            username: env.USERADMIN,
            email: env.EMAIL,
            phone: env.PHONE,
            role: "ROLE_SUPER_ADMIN",
            team: true,
            redirectUri: 'https://www.khallasli.com',
          })
          console.log("Admin already exist.");
    
          crd_basic = await services.credential.insertCredential(myUser.id, 'basic-auth', {
            autoGeneratePassword: false,
            password: env.PASSWORD,
            scopes: []
          })
          console.log("Admin alfffready exist.");
    
          crd_oauth2 = await services.credential.insertCredential(myUser.id, 'oauth2', { scopes: ['super_admin'] })

    }
    else{
        console.log("Admin already exist.");
    }

}
