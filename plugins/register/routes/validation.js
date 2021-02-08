var passwordValidator = require('password-validator');
var schema = new passwordValidator();

exports.validatePassword = function validatePassword (text){
    // let data = {
    //     boolean: "false",
    //     message:""
    // }

    // if(schema.is().min(8).validate(text)){
    //     console.log("zzzz")

    //     data.message = "Minimum length 8"
    //     return data
    // }
    // if(schema.is().max(100).validate(text)){
    //     data.message = "Maximum length 100"
    //     return data
    // }                                    
    // if(!schema.is().min(8).validate(text)){
    //     data.message = "Must have uppercase letters"
    //     return data
    // }
    // if(!schema.has().digits(2).validate(text)){
    //     data.message = "Must have at least 2 digits"
    //     return data
    // }
    // if(!schema.has().not().spaces().validate(text)){
    //     console.log("11111")
    //     data.message = "Should not have spaces"
    //     return data
    // }
    // data.boolean = "true"
    // return data

    schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
     
    // Validate against a password string
            return schema.validate(text)
}