var fb = require('./facebookconnector.js');
var db = require('./db.js');

var methods = {};
methods.getNewPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function(user){
        var userId = user.providerId;
        db.Post.find({userId: {'$ne':userId }}, function(err, docs){
            if (err) {
                console.error(err);
            }
            else {
                console.log(docs);
                res.send(docs);
            }
        })
    })
};

methods.getMyPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function(user){
        var userId = user.providerId;
        db.Post.find({userId: userId }, function(err, docs){
            if (err) {
                console.error(err);
            }
            else {
                console.log(docs);
                res.send(docs);
            }
        })
    })
};

module.exports = methods;