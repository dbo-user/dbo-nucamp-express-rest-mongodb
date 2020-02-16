const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create userSchema object with 3 properties
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// create User model using userSchema and then export it
module.exports = mongoose.model('User', userSchema);