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


const tokenReg = {
    schema: { $id: "./../config/models/schema.js" },
    version: '1.0.0',
    policies: ['plugin'],
    init: function (pluginContext) {
        pluginContext.registerPolicy({
            name: 'tokenReg',
            policy: (params) =>
                async function (req, res, next) {
                    try {
                        console.log("iciiiiiiiiii")
                        console.log("iciiiireq.bodyiiiiii", req.body)

                        const { username, password, client_id, client_secret } = req.body

                        const getToken = async (username, password, client_id, client_secret) => {
                            try {
                                return await axios.post('http://localhost:8080/oauth2/token', {
                                    grant_type: "password",
                                    username: username,
                                    password: password,
                                    client_id: client_id,
                                    client_secret: client_secret
                                })
                            } catch (error) {
                                console.error("111111111111111111111")
                                return res.status(400).json("error", error);

                            }
                        }


                        // const confirm_uri = "http://localhost:8080/oauth2/authorize?response_type=token&client_id=" + myProfile.id + "&" + "redirect_uri=" + myProfile.redirectUri;
                        // console.log("url confirm : " + confirm_uri);
                        // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);

                        // return res.status(201).json({ message: "Check your email : " + agentUser.email + " confirmation Here your email and password : " + randomPassword + "\n" + "Click on this link to change your password \n " + confirm_uri });

                        try {
                            const token = await getToken(username, password, client_id, client_secret)
                            console.log("Token ", token.data)
                            // mail.send_email("confirmation","Here your email and password : "+randomPassword+"\n"+"Click on this link to change your password \n "+ confirm_uri);
                            // return res.status(201).json({ message: "Check your email : " + agentUser.email + " to set a new password " ,token:token.data });
                            req.body = {
                                id_user: req.body.id_user,
                                first_name: req.body.firstname,
                                last_name: req.body.lastname,
                                phone: req.body.phone,
                                typeId: req.body.typeId,
                                token: token.data
                            }
                            next()
                        } catch (error) {
                            return res.status(400).json({ message: error });

                        }


                    } catch (err) {
                        return res.status(422).json({ error: err.message })
                    }

                }
        }
        )
    }
}


module.exports = tokenReg;