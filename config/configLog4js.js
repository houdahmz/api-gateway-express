
const log4js = require("log4js");
var dateNow = new Date();
var dirName = dateNow.getFullYear() + "-" + dateNow.getMonth() + "-" + dateNow.getDate();
log4js.configure({ 
    appenders: {
      out: { type: 'console' }, 
      debug: { type: 'dateFile', filename:"logs/"+dirName+'/debug',"pattern":"dd-MM-yyyy.log", alwaysIncludePattern:true }, 
      default: { type: 'dateFile', filename:"logs/"+dirName+'/default',"pattern":"dd-MM-yyyy.log", alwaysIncludePattern:true}, 
      error: { type: 'dateFile', filename:"logs/"+dirName+'/error', "pattern":"dd-MM-yyyy.log",alwaysIncludePattern:true}, 
      fatal: { type: 'dateFile', filename:"logs/"+dirName+'/fatal', "pattern":"dd-MM-yyyy.log",alwaysIncludePattern:true}, 
      warn: { type: 'dateFile', filename:"logs/"+dirName+'/warn', "pattern":"dd-MM-yyyy.log",alwaysIncludePattern:true} ,
      file: { type: 'file',filename:"logs/"+dirName+'/debug', "pattern":"dd-MM-yyyy.log",alwaysIncludePattern:true}

    },
    categories: {
      default: { appenders: ['out','default'], level: 'info' },
    
      debug: { appenders: ['out','debug'], level: 'debug'},
      fatal: { appenders: ['out','fatal'], level: 'fatal' },
      error: { appenders: ['out','error'], level: 'error' },
      warn: { appenders: ['out','warn'], level: 'warn' },
      cheese: { appenders: ['out','file'], level: 'info' }
    }
})
module.exports = {
 loggerinfo : log4js.getLogger('info'),
 loggererror: log4js.getLogger('error'),
 loggerdebug : log4js.getLogger('debug'),
 loggerfatal : log4js.getLogger('fatal'),
 loggerwarn : log4js.getLogger('debug'),
  loggercheese : log4js.getLogger('cheese'),
 
} 