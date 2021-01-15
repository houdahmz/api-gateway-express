module.exports = {
    version: '1.2.0',
    init: function (pluginContext) {
       let policy = require('./policies/wallet')

       pluginContext.registerPolicy(policy)

       pluginContext.eventBus.on('hot-reload', function ({ type, newConfig }) {
        console.log('hot-reload', type, newConfig);
      });
      pluginContext.eventBus.on('http-ready', function ({ httpServer }) {
        console.log('http ready');
      });
      pluginContext.eventBus.on('https-ready', function ({ httpsServer }) {
        console.log('https ready');
      });
      pluginContext.eventBus.on('admin-ready', function ({ adminServer }) {
        console.log('admin ready');
      });  
      // pluginContext.registerGatewayRoute(app => { app.use(express.json()); 

    },
    policies:['wallet'], // this is for CLI to automatically add to "policies" whitelist in gateway.config
    schema: {  // This is for CLI to ask about params 'eg plugin configure customer-auth'
        "$id":"https://express-gateway.io/schemas/plugins/blacklist.json"
    }
}