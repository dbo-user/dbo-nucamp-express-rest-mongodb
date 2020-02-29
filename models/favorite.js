const mongoose = require('mongoose'); // create mongoose class
const Schema = mongoose.Schema; // create a mongoose outline or schema

// create favoriteSchema document object
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // data type is ObjectId used to reference documents
        ref: 'User' // use this during population, user is connected to the objectId
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId, // data type is ObjectId
        ref: 'Campsite' // campsite connected to the objectId
    }]
}, {
    timestamps: true // current date and time
});

// create Favorite model object using the favoriteSchema and then export it
const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
