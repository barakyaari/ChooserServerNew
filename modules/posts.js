var fb = require('./facebookconnector.js');
var db = require('./db.js');
var cloudinary = require('./cloudinaryConnector.js');
var methods = {};

methods.addPost = function (post, accessToken){
    fb.getUserDetails(accessToken, function (user) {
        db.addPost(post, user.providerId);
    });
};

methods.deletePost = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    fb.getUserDetails(accessToken, function (user) {
        db.Post.findOneAndRemove({_id: postId}, function (err, post) {
            if(!post){
                console.log("Post to delete not found!");
                res.statusCode = 500;
                return res.json({status: "Post Not Found"});
            }
            console.log("deleting post: " + post.title);
            imagesToDelete = [post.image1, post.image2];
            cloudinary.deleteImages([post.image1, post.image2]);
            return res.json({status: "OK"});
        });
    });
};

module.exports = methods;