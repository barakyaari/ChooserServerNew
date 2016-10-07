var fb = require('./facebookconnector.js');
var db = require('./db.js');
var cloudinary = require('./cloudinaryConnector.js');
var methods = {};

methods.addPost = function (post, accessToken){
    fb.getUserDetails(accessToken, function (user) {
        db.addPost(post, user.providerId);
    });
};


module.exports = methods;