const mongoConnString = 'mongodb://chooser:bTrCZbmOliWFXu7TjHEpptUavLESGW516rklKahEisg0Y4FqnQraopE4UkLVFlHzN8zdYxF05CB40t6d4OCYlA==@chooser.documents.azure.com:10250/ChooserDB/?ssl=true';
const url = 'localhost:27017';

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
    name: {
        type: String
    },
    email: {
        type: String
    }
});

var User = mongoose.model('User', userSchema);

var connector = {};

connector.User = User;

connector.findOrCreateUser = function (profile, accessToken, done) {
    User.findOne({
            providerId: profile.providerId
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    access_token: accessToken,
                    providerId: profile.id
                });

                console.log(user.name);
                user.save(function (err, user) {
                    if (err)
                        return console.error(err);
                    console.log('user: %s added', user.name);
                })
            }
        else{//User exists
                if(user.access_token != accessToken){
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
    url1: {
        type: String
    },
    description1: {
        type: String
    },
    url2: {
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

connector.addPost = function(post, userId){
    var newPost = new Post({
        title: post.title,
        url1: post.url1,
        url2: post.url2,
        description1: post.description1,
        description2: post.description2,
        userId: userId
    });

    newPost.save();
};


module.exports = connector;