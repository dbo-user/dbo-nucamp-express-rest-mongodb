const mongoose = require('mongoose'); // create mongoose class
const Schema = mongoose.Schema; // create a mongoose outline or schema

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency; // currency data type will be used for cost

// create promotionSchema document object
const promotionSchema = new Schema({
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
    cost: {
        type: Currency, // removes $ sign and commas
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true // current date and time
});

// create Promotion model object using the promotionSchema and then export it
const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
