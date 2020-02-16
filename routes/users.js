const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// allows user to register on website
router.post('/signup', (req, res, next) => {
  // check for existing user with same name
  User.findOne({username: req.body.username})
  .then(user => {
      if (user) {
          const err = new Error(`**ERROR, THIS USER, ${req.body.username} already exists!`);
          err.status = 403; // forbidden error code
          return next(err); // pass to express
      } else { 
        // okay to create new user document
          User.create({
              username: req.body.username,
              password: req.body.password})
          .then(user => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({status: 'YES, Registration Successful!', user: user});
          })
          .catch(err => next(err));
      }
  })
  .catch(err => next(err)); // error for findOne
});

// user already logged in
router.post('/login', (req, res, next) => {
  if(!req.session.user) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
          const err = new Error('ERROR, You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }
      // parse user name and password to the auth array
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
    
      // check username against existing usernames
      User.findOne({username: username})
      .then(user => {
          if (!user) {
              const err = new Error(`ERROR User ${username} does not exist!`);
              err.status = 403;
              return next(err);
          } else if (user.password !== password) {
              const err = new Error('CHECK THIS, Your password is incorrect!');
              err.status = 403;
              return next(err);
          } else if (user.username === username && user.password === password) {
              req.session.user = 'authenticated';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('GREAT, You are authenticated!')
          }
      })
      .catch(err => next(err));
  } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('HEY, You are already authenticated!');
  }
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
