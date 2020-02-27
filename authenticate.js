const passport = require('passport'); // allows managing authentication
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token'); // use faceboom module for facebook login authentication

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// return a token
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600}); // expires in 1 hour
};

// configure json web token strategy
const opts = {}; // empty object
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('**JWT payload:', jwt_payload);
            // try to find same user
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else { // no error but also no user
                    return done(null, false);
                }
            });
        }
    )
);
// is the user logged in? verify the request is from authenticated user
exports.verifyUser = passport.authenticate('jwt', {session: false});

// week 3 assignment, verify if the user is admin
exports.verifyAdmin = function (req, res, next) {
    // does the admin flag equal true?
    if (req.user.admin) {
        next(); // pass to the next middleware
    } else {
        // if the user is not admin return error
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403; // forbidden status code
        return next(err);
    }
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {   // get the Api id and secret from the config file
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            // search for user with facebook id that matches profile id
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false); // error
                }
                if (!err && user) { // no error but user already exists without facebook id
                    return done(null, user);
                } else { // create new user with facebook id
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false); // error trying to save user
                        } else {
                            return done(null, user); // successful save
                        }
                    });
                }
            });
        }
    )
);