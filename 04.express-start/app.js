'use strict';
/**
 * Module dependencies.
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo/es5')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const favicon = require('serve-favicon');
const logger = require('./lib/logger');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 *
 * Default path: .env (You can remove the path argument entirely, after renaming `.env.example` to `.env`)
 */
dotenv.load({ path: '.env.example' });

const homeRoute = require('./routes/home');
const userRoute = require('./routes/user');

const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  logger.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
const hbs = require('express-handlebars').create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: require('./lib/hbs_helpers.js').helpers,
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(compress());

if (app.get('env') === 'production') {
  app.use(morgan('common', {
    skip(req, res) {
      return res.statusCode < 400;
    },
    stream: logger.stream,
  }));
} else {
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB || process.env.MONGOLAB_URI,
    autoReconnect: true,
  }),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use('/', homeRoute);
app.use('/user', userRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('${req.path} Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  logger.info('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
