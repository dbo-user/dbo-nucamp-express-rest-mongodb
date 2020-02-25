const cors = require('cors'); // cross origin resource sharing
// give a web application running at one origin, access to selected resources from a different origin

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(`HEADER ${req.header('Origin')}`);
    // search for string in header, !-1 means a match was found
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // allow request
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); // allows cors for all origins
exports.corsWithOptions = cors(corsOptionsDelegate); // checks the whiteList origins