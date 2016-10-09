const mongoConnString = 'mongodb://chooser:bTrCZbmOliWFXu7TjHEpptUavLESGW516rklKahEisg0Y4FqnQraopE4UkLVFlHzN8zdYxF05CB40t6d4OCYlA==@chooser.documents.azure.com:10250/ChooserDB/?ssl=true';
const url = 'localhost:27017';
var fbconnector = require('./facebookconnector.js');

var mongoose = require('mongoose');
mongoose.connect(mongoConnString);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log('Connected to DB!');
});

var userSchema = mongoose.Schema({
    providerId: {
        type: String
    },
    access_token: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String
    },
    birthday: {
        type: Date
    },
    email: {
        type: String
    }
});

var postSchema = mongoose.Schema({
    title: {
        type: String
    },
    image1: {
        type: String
    },
    description1: {
        type: String
    },
    image2: {
        type: String
    },
    description2: {
        type: String
    },
    userId: {
        type: String
    },
    votes1: {
        type: Number
    },
    votes2: {
        type: Number
    },
    votedBy: [
        {
            userId: String,
            vote: Number
        }
    ]

});

var User = mongoose.model('User', userSchema);

var connector = {};

connector.User = User;

connector.updateUser = function (token) {
    fbconnector.getUserDetails(token, function (newUser) {
        User.findOne({
            providerId: newUser.providerId
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    access_token: token,
                    gender: newUser.gender,
                    birthday: newUser.birthday,
                    providerId: newUser.providerId,
                    email: newUser.email
                });

                console.log(user.firstName);
                user.save(function (err, user) {
                    if (err)
                        return console.error(err);
                    console.log('user: %s added', user.firstName);
                })
            }
            else {//User exists
                if (user.access_token != token) {
                    user.access_token = token;
                    user.save();
                    console.log('access token updated: %s', token);
                }
                console.log("Welcome back: %s", newUser.firstName);
            }
        });
    });
};

var Post = mongoose.model('Post', postSchema);

connector.Post = Post;

connector.addPost = function (post, userId) {

    var newPost = new Post({
        title: post.title,
        image1: post.image1,
        image2: post.image2,
        description1: post.description1,
        description2: post.description2,
        userId: userId,
        votes1: post.votes1,
        votes2: post.votes2,
        votedBy: []
    });

    newPost.save();
};

connector.addUserVote = function (userId, postId, vote, cont) {
    console.log("Adding user vote: " + postId);
    if (vote == 1) {
        Post.findByIdAndUpdate(postId,
            {
                $inc: {votes1: 1},
                $push: {
                    votedBy: {
                        userId: userId,
                        vote: vote
                    }
                }
            },
            function (err) {
                if (err) {
                    console.log("Post not found");
                    cont(false);
                }
                else {
                    cont(true);
                }
            });
    }
    else if (vote == 2) {
        Post.findByIdAndUpdate(postId,
            {
                $inc: {votes1: 1},
                $push: {
                    $push: {
                        votedBy: userId
                    }
                }
            },
            function (err) {
                if (err) {
                    console.log("Post not found");
                    cont(false);
                }
                else {
                    cont(true);
                }
            }
        );
    }
};

connector.getPosts = function (userId, cont) {
    console.log("Getting posts, userId: " + userId);
    Post.find(
        {'userId': {$ne: userId }}
        , function (err, docs) {
            var filteredDocs = filterUserVotedPosts(userId, docs);
            cont(err, filteredDocs);
        })
};

//TODO: Find a MongoDB way to filter this in the query itself.
filterUserVotedPosts = function(userId, docs){
    var filteredPosts = [];
    var found = false;
    for(var index in docs){
        var post = docs[index];
        console.log("Checking: " + post.title);
        var votedBy = post.votedBy;
        for(var i = 0; i < post.votedBy.length; i++){
            var voter = post.votedBy[i];
            if(voter.userId == userId){
                found = true;
                console.log("Filtering: " + post.title);
                break;
            }
        }
        if(!found){
            filteredPosts.push(post);
        }
        found = false;
    }
    return filteredPosts;
};

module.exports = connector;