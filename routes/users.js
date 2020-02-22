const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

// week 3 assignment, only allow admin users to access user documents 
/*
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  if (req.user.admin) {
    res.send(req.body)
  } else {
    res.send('what?????')
  }
  
});  */

router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  //if (req.user.admin) {
    User.find()
    .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    })
    .catch(err => next(err));
  //}  
}); 
/*
router.get('/', function(req, res, next) {
  res.send(req.body);
}); */

// allows user to register on website
router.post('/signup', (req, res) => {
  // passport register method
  User.register(
      new User({username: req.body.username}),
      req.body.password,
      (err, user) => {
          if (err) {
              res.statusCode = 500; // internal server error
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err}); // send back error
          } else { // successful
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
          user.save(err => {
              if (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({err: err});
                  return;
              }  
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'GREAT Registration Successful!'});
              });
          }); // end user.save
        }
      }
  ); // end user register
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
