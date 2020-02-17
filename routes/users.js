const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// allows user to register on website
router.post('/signup', (req, res) => {
  // passport register method
  User.register(
      new User({username: req.body.username}),
      req.body.password,
      err => {
          if (err) {
              res.statusCode = 500; // internal server error
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err}); // send back error
          } else { // successful
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'GREAT Registration Successful!'});
              });
          }
      }
  );
});

// user already logged in
router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'YES You are successfully logged in!'});
});

// logging out user
router.get('/logout', (req, res, next) => {
  if (req.session) {
    // if session exists, remove it
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not actaully logged in!');
    err.status = 403;
    return next(err);
  }
});


module.exports = router;
