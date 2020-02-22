const express = require('express'); // import the express module into the express variable
const bodyParser = require('body-parser'); // import the body-parser module to extract the body from HTTP requests
const Partner = require('../models/partner'); // import the partner model from the models folder
const authenticate = require('../authenticate');

const partnerRouter = express.Router(); // create partner router object

partnerRouter.use(bodyParser.json()); // use bodyParser to make data available in req.body

// define router endpoint for HTTP requests
partnerRouter.route('/')
// GET request to find the partner information
.get((req, res, next) => {
    Partner.find()
    .then(partners => { // successful find operation so do this
        res.statusCode = 200; // success code
        res.setHeader('Content-Type', 'application/json');
        res.json(partners); // display partners information in json format
    })
    .catch(err => next(err)); // not successful do this default error handler 
})
// POST request to post new partner data
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body)
    .then(partner => {
        console.log('Partner Created ', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
// PUT request to update is not allowed
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /partners');
})
// DELETE request to delete partner
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

// endpoint for a specific partner id
partnerRouter.route('/:partnerId')
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
// POST to a specific id is not allowed
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
})
// PUT request to update a specific id 
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, { new: true })
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
// DELETE request to a specific id
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;