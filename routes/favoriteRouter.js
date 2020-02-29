const express = require('express'); // import the express module into the express variable
const bodyParser = require('body-parser'); // import the body-parser module to extract the body from HTTP requests
const Favorite = require('../models/favorite'); // import the favorite model from the models folder
const authenticate = require('../authenticate');
const cors = require('./cors'); // import cross-origin from routes folder

const favoriteRouter = express.Router(); // create favorite router object

favoriteRouter.use(bodyParser.json()); // use bodyParser to make data available in req.body

// define router endpoint for HTTP requests
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

// GET request to find the favorite information
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  // retrieve the list of favorites for that user, 
  // then populate the user and campsites refs before returning the favorites. 
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then( favorites => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
// POST request to post new favorite data
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then( favorite => {
    // If there is no favorite document for the user, 
    // you will create a favorite document for the user and add the campsite IDs
          if (!favorite) {
            Favorite.create({})
              .then(favorites => {
                favorites.user = req.user._id;
                favorites.campsites = req.body;
                favorites.save()
                  .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          } else {
    // check which campsites in the request body are already in the campsites array of the favorite document, 
    // if any, and you will only add to the document those that are not already there.
            Favorite.create({})
              .then( favorites => {
              //console.log(favorite);
                for (let i = 0; i < req.body.length; i++) {
                  campsiteId = req.body[i]._id;
                  if (indexOf(favorites.campsites.campsiteId) === -1) {
                    favorites.campsites.push(campsiteId);
                  }
                  favorites.user = req.user._id;
                  favorites.save()
                  .catch(err => next(err));
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
              });
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
// PUT request to update is not allowed
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
// DELETE request to delete favorite
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id, (err, user) => {
      if (err) {
        return document(err, false);
      } else {
// delete the entire list of favorites corresponding to the user
        Favorite.remove({ user: mongoose.Types.ObjectId(user._id) })
          .then( resp => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(resp);
            },
            err => next(err)
          )
          .catch(err => next(err));
      }
    });
  });

// endpoint for a specific campsite id
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/campsiteId');
})
// POST to a specific id 
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.find({ user: req.user._id },
    (err, favorite) => {
      if (err) return next(err);
      console.log(favorite);
      // if no favorite campsite list exists then create one
      if (!favorite) {
    
        Favorite.create({ user: req.user._id });
        then(favorite => {
          favorite.campsites.push({ _id: req.params.campsiteId });
          favorite
            .save()
            .then(favorite => {
              Favorite.findById(favorite._id)
                .populate('user')
                .populate('campsites')
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                });
            })
            .catch(err => {
              return next(err);
            });
        });
      } // end if
      // is url campsite already in the list of favorites?
      if (favorite.includes(req.params.campsiteId)) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text-plain');
          res.end(`Campsite ${req.params.campsiteId} is already in the list of favorites.`);
       } // else not in the list
        else {
          favorite = new Favorite({ user: req.user._id });
          favorite.campsites = [];
          favorite.campsites.push({ _id: req.params.campsiteId });
          favorite.save()
            .then(favorite => {
              Favorite.findById(favorite._id)
                .populate('user')
                .populate('campsites')
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                });
              })
              .catch(err => {
                return next(err);
              });
            }
        }) 
})
// PUT request to update a specific id 
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/campsiteId');
})
// DELETE request to a specific id
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
Favorite.findOne({ user: req.user._id }, (err, favorites) => {
    if (err) return next(err);

    //console.log(favorites);
    const index = favorites.campsites.indexOf(req.params.campsiteId);
// Remove the specified campsite from the list of the user's list of favorites
    if (index >= 0) {
      favorites.campsites.splice(index, 1);
      favorites.save();
      favorites.save()
        .then(favorites => {
          Favorite.findById(favorites._id)
            .populate('user')
            .populate('campsites')
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            });
        })
        .catch(err => {
          return next(err);
        });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Campsite ${req.params._id} not found`);
    }
  });
});

module.exports = favoriteRouter;