const passport = require('passport'); // allows managing authentication
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

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