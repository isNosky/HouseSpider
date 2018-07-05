var log4js = require('log4js');
log4js.configure({
  appenders: {
    out:{ type: 'console' },
    run:{ type: 'dateFile', filename: 'logs/run.log',pattern: "_yyyy-MM-dd",alwaysIncludePattern: false},
    access:{ type: 'dateFile', filename: 'logs/access.log',pattern: "_yyyy-MM-dd",alwaysIncludePattern: false}
  },
  categories: {
    default: { appenders: [ 'out', 'run', 'access' ], level: 'debug'}
  },
  replaceConsole: true
});

var accesslog = log4js.getLogger('access');

exports.logger = log4js.getLogger('run');;

exports.use = function(app) {
  //页面请求日志,用auto的话,默认级别是WARN
  //app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));
  app.use(log4js.connectLogger(accesslog, {level:'debug'}));
}