module.exports = {
  version: '1.2.0',
  init: function (pluginContext) {
    pluginContext.registerGatewayRoute(require('./routes/register-eg'));
    pluginContext.registerGatewayRoute(require('./routes/authentication'));
  },
  policies:['hello'], // this is for CLI to automatically add to "policies" whitelist in gateway.config
  schema: {  // This is for CLI to ask about params 'eg plugin configure customer-auth'
      "$id":"https://express-gateway.io/schemas/plugins/blacklist.json"
  }
}