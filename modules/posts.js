var fb = require('./facebookconnector.js');
var db = require('./db.js');
var cloudinary = require('./cloudinaryConnector.js');

var methods = {};

methods.getPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;
        db.getPosts(userId, function(err, docs){
            if (err) {
                console.error(err);
            }
            else {
                console.log(docs);
                res.send(docs);
            }
        });
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

    if(token == "NotMyPost"){
        var post = {};
        post.title = req.get('title');
        post.image1 = req.get('image1');
        post.description1 = req.get('description1');
        post.image2 = req.get('image2');
        post.description2 = req.get('description2');
        post.votes1 = req.get('votes1');
        post.votes2 = req.get('votes2');
        post.usersVotes = [];
        post.utcDate = Date.now();

        if (!post.title || !post.image1 || !post.image2) {
            console.log('add post request with missing parameters');
            res.send('add post failed!');
        }
        else {
            db.addPost(post, "NotMyPost");
            console.log("Post Added");
            return res.json({status: "OK"});
        }
    }

    else {

        fb.getUserDetails(token, function (user) {
            var token = req.get('token');
            var post = {};
            post.title = req.get('title');
            post.image1 = req.get('image1');
            post.description1 = req.get('description1');
            post.image2 = req.get('image2');
            post.description2 = req.get('description2');
            post.votes1 = req.get('votes1');
            post.votes2 = req.get('votes2');
            post.usersVotes = [];
            post.utcDate = Date.now();


            if (!post.title || !post.image1 || !post.image2) {
                console.log('add post request with missing parameters');
                res.send('add post failed!');
            }
            else {
                db.addPost(post, user.providerId);
                console.log("Post Added");
                return res.json({status: "OK"});
            }
        });
    }
};

methods.deletePost = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    fb.getUserDetails(accessToken, function (user) {
        db.Post.findOneAndRemove({_id: postId}, function (err, post) {
            if (!post) {
                console.log("Post to delete not found!");
                res.statusCode = 500;
                return res.json({status: "Post Not Found"});
            }
            console.log("deleting post: " + post.title);
            cloudinary.deleteImages([post.image1]);
            cloudinary.deleteImages([post.image2]);
            return res.json({status: "OK"});
        });
    });
};

methods.vote = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    var vote = req.get('selected');
    fb.getUserDetails(accessToken, function (user) {
            var userId = user.providerId;
            db.addUserVote(userId, postId, vote, function(success){
                if(!success){
                    console.log("Post not found!");
                    res.statusCode = 500;
                    return res.json({status: "Post Not Found"});
                }
                else{
                    console.log("Vote accepted");
                    return res.json({status: "OK"});

                }
            });
        }
    );
};

module.exports = methods;