var fb = require('./facebookconnector.js');
var db = require('./db.js');

var methods = {};
methods.getNewPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;
        db.Post.find({userId: {'$ne': userId}}, function (err, docs) {
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
    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;
        db.Post.find({userId: userId}, function (err, docs) {
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

methods.addPost = function (req, res) {
        console.log("Add post recieved: " + req.get('title'));
        var token = req.get('token');
        var post = {};
        post.title = req.get('title');
        post.image1 = req.get('image1');
        post.description1 = req.get('description1');
        post.image2 = req.get('image2');
        post.description2 = req.get('description2');

        if (!post.title || !post.image1 || !post.image2) {
            console.log('add post request with missing parameters');
            res.send('add post failed!');
        }
        else {
            posts.addPost(post, token);
            res.send('add post successful!');
        }
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