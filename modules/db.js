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
                    email: newUser.email,

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

connector.findOrCreateUser = function (newUser, accessToken, done) {
    User.findOne({
            providerId: user.providerId
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    access_token: accessToken,
                    gender: user.gender,
                    birthdate: user.birthdate,
                    providerId: user.id,
                    email: user.email,

                });

                console.log(user.name);
                user.save(function (err, user) {
                    if (err)
                        return console.error(err);
                    console.log('user: %s added', user.name);
                })
            }
            else {//User exists
                if (user.access_token != accessToken) {
                    user.access_token = accessToken;
                    user.save();
                    console.log('access token updated: %s', accessToken);
                }
                console.log("Welcome back: %s", user.name);
            }
            done(null, user);
        }
    )
};

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
    }
});

var Post = mongoose.model('Post', postSchema);

connector.Post = Post;

connector.addPost = function (post, userId) {

    var newPost = new Post({
        title: post.title,
        image1: post.image1,
        image2: post.image2,
        description1: post.description1,
        description2: post.description2,
        userId: userId
    });

    newPost.save();
};

connector.getPost = function(postId, cont){
    Post.findOne({_id: postId})
}

module.exports = connector;