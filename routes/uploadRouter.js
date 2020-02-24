const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer'); // import multer for image file upload verification

// use multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // cb is callback
        cb(null, 'public/images'); // null is no error, then a folder path
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname) // makes filename on front and back sides the same
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { // use regex to look for file extensions
        return cb(new Error('SORRY wrong file extension, You can upload only image files!'), false);
    }
    cb(null, true); // no error in filename
};

// call multer to handle image file uploads
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router(); // create uploadRouter object

// configure the endpoint requests
uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
// POST is allowed with a single image file, uisng multer to process request
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    console.log(`SUCCESS - image file uploaded: ${imageFile}`);
    res.statusCode = 200; // success
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); // send file information
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;