module.exports = {
  version: '1.2.0',
  init: function(pluginContext) {
    pluginContext.registerGatewayRoute(require('./routes/register-eg'));
    pluginContext.registerGatewayRoute(require('./routes/authentication'));
    pluginContext.registerGatewayRoute(require('./routes/Initialization'));
    pluginContext.registerGatewayRoute(require('./routes/search'));
    pluginContext.registerGatewayRoute(require('./routes/handlePassword'));
    pluginContext.registerGatewayRoute(require('./routes/handleUserStatus'));
    pluginContext.registerGatewayRoute(require('./routes/statistique'));
    pluginContext.registerGatewayRoute(require('./routes/user'));
    pluginContext.registerGatewayRoute(require('./routes/upload'));
  },
  policies: ['hello'], // this is for CLI to automatically add to "policies" whitelist in gateway.config
  schema: { // This is for CLI to ask about params 'eg plugin configure customer-auth'
      '$id': 'https://express-gateway.io/schemas/plugins/blacklist.json',
  },
};
