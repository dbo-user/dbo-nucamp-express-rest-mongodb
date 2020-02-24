var createError = require('http-errors'); // imports
var express = require('express'); // imports access to the express module
var path = require('path');
var logger = require('morgan');

const passport = require('passport');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

const url = config.mongoUrl;
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

var app = express(); // Create a new Express Instance to create an express application

// catch every type of server request
// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) { // HTTPS request?
    return next();
  } else { // not HTTPS
      console.log(`WE ARE going SECURE by Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); // cookie key

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter); // file uploads

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
// export so other files are allowed to access the exported code
module.exports = app;
