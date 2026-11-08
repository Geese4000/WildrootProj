require('dotenv').config();

// Refuse to start in production with the fallback (publicly visible) secret
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var MongoStore = require('connect-mongo');

require('./app_server/models/db');
const indexRouter = require('./app_server/routes/index');
const apiRouter = require('./app_server/routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Render sits in front of the app as a proxy and handles HTTPS for it.
// Trusting that proxy lets Express see the original protocol, so req.secure
// and secure cookies work behind it.
app.set('trust proxy', 1);

// HSTS: once a browser has reached the site over HTTPS, tell it to only
// ever use HTTPS for the next 180 days.
app.use(function(req, res, next) {
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

// express-session keeps session data on the server (in MongoDB, via
// connect-mongo); the browser only holds a signed session id cookie.
app.use(session({
  secret: process.env.SESSION_SECRET || 'wildroot-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/wildroot',
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 // 1 day, in seconds
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day, in milliseconds
    httpOnly: true,   // browser JavaScript can't read the cookie
    sameSite: 'lax',  // not sent on cross-site POSTs (basic CSRF protection)
    secure: 'auto'    // marked HTTPS-only whenever the request came over HTTPS
  }
}));

// Passport: local (email + password) strategy, backed by the session above
require('./app_server/config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
