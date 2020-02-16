var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('HALLELUJAH! YOU ARE CONNECTED correctly to the server'), 
    err => console.log('NOT CONNECTED TO SERVER ERROR', err)
);

const hostname = 'localhost';
const port = 3000;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321')); // cookie key

// authentication
function auth(req, res, next) {
  console.log('**REQUEST HEADER', req.headers);
  if (!req.signedCookies.user) {
    const authHeader = req.headers.authorization;
    // if authHeader is null
    if (!authHeader) {
        const err = new Error('You are NOT authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401; // unauthorized code
        return next(err); // pass error to express
    }
    // parse user name and password to the auth array
    
    const auth1 = Buffer.from(authHeader.split(' ')[1], 'base64');
    console.log('AUTH1 is ', auth1);
    let auth2 = auth1.toString();
    console.log('AUTH2 is', auth2);
    let auth3 = auth2.split(':');
    console.log('AUTH3 is ',auth3);


    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    console.log('**AUTH HEADER is ', authHeader);
    console.log('**AUTH is ',auth);
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {
        res.cookie('user', 'admin', {signed: true}); // create cookie  
        return next(); // authorized, access is granted
    } else {
        const err = new Error('You are so not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        return next(err);
      }
  } else {
    if (req.signedCookies.user === 'admin') {
        return next(); // access granted
    } else {
        const err = new Error('Wait, you are not authenticated!');
        err.status = 401;
        return next(err);
      }
    }
} // end auth function
app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

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

app.listen(port, hostname, () => {
  console.log(`Hey Look, The Server is running at http://${hostname}:${port}/`);
});

module.exports = app;
