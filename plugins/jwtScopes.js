const jwtz = require('express-jwt-authz');

// const plugin = {
//   version: '1.0.0',
//   policies: ['jwtScopes'],
//   init: function (pluginContext) {
//     pluginContext.registerPolicy({
//       name: 'jwtScopes',
//       policy: (params) => (req, res, next) => jwtz(req.egContext.apiEndpoint.scopes)(req, res, next)
//     })
//   }
// }

// module.exports = plugin;


const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
const services = require('express-gateway/lib/services/')

const plugin = {
    schema: { $id: "./../config/models/schema.js" },
    version: '1.0.0',
    policies: ['jwtScopes'],
    init: function (pluginContext) {
        pluginContext.registerPolicy({
            name: 'jwtScopes',
            policy: (params) => (req, res, next) => jwtz(req.egContext.apiEndpoint.scopes)(req, res, next)
          })}    
    }

  
  module.exports = plugin;