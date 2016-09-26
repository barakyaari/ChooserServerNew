var express = require('express');
var router = express.Router();
var connector = require('../modules/db.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer');
var facebookConnector = require('../modules/facebookconnector');


passport.use(new FacebookStrategy({
        clientID: '1768515096768793',
        clientSecret: 'd24b812a9423b18a25a121a952afa14b',
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        //TODO: register new user
        console.log("Facebook login requested. profile: " + profile.displayName);
        console.log("Access token: %s", accessToken);
        console.log("Refresh token: %s", refreshToken);
        connector.findOrCreateUser(profile, accessToken, done);
    })
);

passport.use(
    new BearerStrategy(
        function (token, done) {
            connector.User.findOne({access_token: token},
                function (err, user) {
                    if (err) {
                        return done(err)
                    }
                    if (!user) {
                        return done(null, false)
                    }
                    console.log('Authorized: %s', user.providerId);

                    return done(null, user, {scope: 'all'})
                }
            );
        }
    )
);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
// router.get('/login', passport.authenticate('facebook'), {
//     successRedirect: '/',
//     failureRedirect: '/login?failedSocial=facebook'
// });

router.get('/auth/facebook', passport.authenticate('facebook', {session: false}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback/',
    passport.authenticate('facebook', {session: false}),
    function (req, res) {
        console.log('callback!');
        res.set('access_token', req.user.access_token);
        res.sendStatus(200);
    }
);

router.get(
    '/profile',
    passport.authenticate('bearer', {session: false}),
    function (req, res) {
        res.send("LOGGED IN as " + req.user.name + " - <a href=\"/logout\">Log out</a>");
    }
);

router.post(
    '/addPost',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        var userId = req.user.providerId;
        var post = {};
        post.title = req.get('title');
        post.url1 = req.get('url1');
        post.description1 = req.get('description1');
        post.url2 = req.get('url2');
        post.description2 = req.get('description2');

        if (!post.title || !post.url1 || !post.url2) {
            console.log('add post request with missing parameters');
            res.send('add post failed!');
        }

        else {
            console.log('add post request: %s - %s', post.title, userId);
            connector.addPost(post, userId)
            res.send('add post successful!');
        }
    }
);

router.get(
    '/deletePost',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        var postId = req.get('id');

        connector.Post.findOneAndRemove({_id: postId}, function (err, docs) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(docs);
                    res.sendStatus(200);
                }
            }
        )
    }
);

router.get(
    '/getAllPosts',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        connector.Post.find({}, function (err, docs) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(docs);
                    res.send(docs);
                }
            }
        )
    }
);

router.get(
    '/getAllMyPosts',
    passport.authenticate('bearer', {
        session: false
    }),
    function (req, res) {
        connector.Post.find({userId: req.user.providerId}, function (err, docs) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(docs);
                    res.send(docs);
                }
            }
        )
    }
);

router.post(
    '/login',
    function (req, res) {
        console.log('login request. token: %s, uid:%s', req.get('token'), req.get('userId'));
        var token = req.get('token');
        var userId = req.get('userId');
        if (!facebookConnector.isLegalToken(token, userId, function(isLegal){
            if(isLegal) {
                res.send('token is legal!');
            }
            else{
                res.send('token is not legal!');
            }
            })){
        }
    //     connector.User.find({userId: req.userId}, function (err, docs) {
    //             if (err) {
    //                 console.error(err);
    //             }
    //             else {
    //                 console.log(docs);
    //                 res.send(docs);
    //             }
    //         }
    //     )
    }
);



module.exports = router;
