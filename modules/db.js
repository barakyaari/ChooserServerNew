var consts = require('./consts.js')

const mongoConnString = 'mongodb://chooser:Nsghvnjac1@ds059375.mlab.com:59375/chooserdb';
// const url = 'localhost:27017';
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
    },
    tokens: {
        type: Number
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
            vote: Number,
            gender: String,
            age: Number
        }
    ],
    push_factor: {
        type: Number
    },
    utcDate: {
        type: Date
    }
});

var User = mongoose.model('User', userSchema);
var Post = mongoose.model('Post', postSchema);

var connector = {};
connector.Post = Post;
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

connector.addPost = function (post, userId, cont) {

    var newPost = new Post({
        title: post.title,
        image1: post.image1,
        image2: post.image2,
        description1: post.description1,
        description2: post.description2,
        userId: userId,
        votes1: post.votes1,
        votes2: post.votes2,
        votedBy: [],
        push_factor: post.push_factor,
        utcDate: post.utcDate
    });

    newPost.save(function(err, record){
        cont(record._id);
    });
};

connector.addUserVote = function (userId, postId, vote, gender, age, cont) {
    var callback = function (err) {
        if (err) console.error(err);
        return err;
    };

    var update_query = {};

    if      (vote == 1) update_query["$inc"] = { votes1: 1};
    else if (vote == 2) update_query["$inc"] = { votes2: 1};

    update_query["$push"] = {
        votedBy: {
            userId: userId,
            vote: vote,
            gender: gender,
            age: age
        }
    };

    console.log("Adding user vote: " + postId);

    var err = null;

    err |= Post.findByIdAndUpdate(postId, update_query, callback);
    err |= Post.update(
        { _id: postId, push_factor: { $gt: 0 } },
        { $inc: { push_factor: consts.push_factor.decrement } },
        null,
        callback);
    err |= User.update({ providerId: userId }, { $inc: { tokens: 1} }, null, callback);

    cont(err);
};

connector.report = function (userId, postId, gender, age, cont) {
    console.log("Adding user Report: " + postId);
    connector.addUserVote(userId, postId, 0, gender, age, cont);
};

connector.getPosts = function (userId, cont) {
    console.log("Getting posts of " + userId);
    Post.find({
        userId: { $ne: userId },
        votedBy: { $not: { $elemMatch: { userId: userId } } }
    }, function (err, docs) {
        cont(err, docs);
    });
};

connector.getPostStatistics = function (postId, cont) {
    console.log("Getting posts, userId: " + postId);
    Post.find({ '_id': postId }, 'votedBy',
        function (err, docs) {
            var votedBy = null;
            if (docs.length > 0)
                votedBy = docs[0].votedBy;
            else
                err = "Post not found!";

            cont(err, votedBy);
        });
};

connector.promotePost = function (postId, userId, succ, fail) {
    var cost = consts.promotion_cost;
    var push_factor_change = cost * consts.token_to_push_factor_ratio;
    var tokens = User.findOne({ providerId: userId }, { tokens: 1 });

    if (tokens < cost)
        fail("Insufficient tokens");

    cost *= -1;
    User.update({ providerId: userId }, { $inc: { tokens: cost } }, function (err) {
        if (err) fail(err.message);
    });
    Post.update({ _id: postId }, { $inc: { push_factor: push_factor_change } }, function (err) {
        if (err) fail(err.message);
    });

    succ();
};

module.exports = connector;