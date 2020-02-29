const express = require('express'); // import the express module into the express variable
const bodyParser = require('body-parser'); // import the body-parser module to extract the body from HTTP requests
const Favorite = require('../models/favorite'); // import the favorite model from the models folder
const authenticate = require('../authenticate');
const cors = require('./cors'); // import cross-origin from routes folder

const favoriteRouter = express.Router(); // create favorite router object

favoriteRouter.use(bodyParser.json()); // use bodyParser to make data available in req.body

// define router endpoint for HTTP requests
favoriteRouter.route('/')
// GET request to find the favorite information
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
    .then(favorites => { // successful find operation so do this
        res.statusCode = 200; // success code
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites); // display favorites information in json format
    })
    .catch(err => next(err)); // not successful do this default error handler 
})
// POST request to post new favorite data
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.create(req.body)
    .then(favorite => {
        console.log('Favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
// PUT request to update is not allowed
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
// DELETE request to delete favorite
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

// endpoint for a specific campsite id
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findById(req.params.campsiteId)
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
// POST to a specific id is not allowed
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
// PUT request to update a specific id 
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, { new: true })
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
// DELETE request to a specific id
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;