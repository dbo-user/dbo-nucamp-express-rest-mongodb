const mongoose = require('mongoose'); // create mongoose class
const Schema = mongoose.Schema; // create a mongoose outline or schema

// create partnerSchema document object
const partnerSchema = new Schema({
    name: {
        type: String, // data type is string
        required: true, // cannot be empty
        unique: true // a unique index is created for each name
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean, // true or false
        default: false // original value is false
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true // current date and time
});

// create Partner model object using the partnerSchema and then export it
const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;
