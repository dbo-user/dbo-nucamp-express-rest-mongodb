const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// create userSchema object with 3 properties
const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

// authentification methods of passport
userSchema.plugin(passportLocalMongoose);

// create User model using userSchema and then export it
module.exports = mongoose.model('User', userSchema);