var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var bodyParser = require('body-parser');
var pg = require('pg');
var ws = require('ws').Server;
var winston = require('winston');
var expressWinston = require('express-winston');
var routes = require('./public/routes/index');
var users = require('./public/routes/users');
var apis = require('./public/routes/api_routes');
var pub_apis = require('./public/routes/pub_api_routes');

var app = express();

var myLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize:true,
      json:true
    }),
    new (winston.transports.File)({
      filename: './logs/debug.json',
      json:false,
      humanReadableUnhandledException:true,
      formatter:function(options){
        if (options.meta.stack){

          return JSON.stringify({stack: options.meta.stack, message:options.message, date:new Date().toLocaleString()});
        }
        else{

          return JSON.stringify({message:options.message, date:new Date().toLocaleString()});
        }
        
      }
    })
  ]
});

app.set("myLogger",myLogger);
// view engine setup
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'pug');

app.use(compress());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/users', users);
app.use('/api', apis);
app.use('/api/v1', pub_apis);
app.use('/', routes);
// express-winston errorLogger makes sense AFTER the router.
app.use(expressWinston.errorLogger({
  winstonInstance:myLogger
}));
//myLogger.info("Server is listening on localhost:800");

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
