const services = require('express-gateway/lib/services/');
const jwt = require('jsonwebtoken');
const env = require('../../config/env.config');
const expiresIn = 3.6 * 1000 * 1000; // in ms //equals to 1 hour 
const user_service = require('../../services/user/user.service');

exports.addUser = async (body, password,scopes) => {
    // ///////////////////////////create user//////////////////////////////////////////////////////
    const user = await user_service.insert(body);
    console.log('user', user);
    // ///////////////////////////create basic-auth credential for authentication//////////////////
    const crd_basic = await services.credential.insertCredential(user.id, 'basic-auth', {
      autoGeneratePassword: false,
      password: password,
      scopes: [],
    });
    console.log('crd_basic',crd_basic);
    // ///////////////////////////create basic-auth credential for authorization with scope////////
    const crd_oauth2 = await services.credential.insertCredential(user.id, 'oauth2', {scopes: scopes});
    console.log('crd_oauth2',crd_oauth2);
    return user;
};    
exports.createJwt = async (username, password = null) => {
    console.log('password',password);
    let json = {
        username: username,
        password: password,
    };
    if (!password) json = {username: username};
    const myUserJwt = await jwt.sign(json, `${env.JWT_SECRET}`, {
        issuer: 'express-gateway',
        audience: 'something',
        expiresIn: expiresIn,
        subject: `${env.JWT_SUBJECT}`,
        algorithm: `${env.ALGORITHM}`,
      });
      return myUserJwt;
}; 
exports.verifyJwt = async (token) => {
    return await jwt.verify(token, `${env.JWT_SECRET}`, {algorithms: ['HS256']});
}; 
