var express = require('express');
var router = express.Router();
var connector = require('../modules/db.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: '1768515096768793',
        clientSecret: 'd24b812a9423b18a25a121a952afa14b',
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        //TODO: register new user
        console.log("Facebook login requested. profile: " + profile.displayName);
        connector.addUser(profile.displayName, profile.id, profile.emails[0].value)
        })
);

router.get('/register', function(req, res) {
    var userName = req.get('username');
    var password = req.get('password');
    console.log('logout requested by:  ' + userName);
    if(connector.userExists(userName)){
        res.send('user already exists!');
    }
    else{
        connector.addUser(userName, password);
        res.send('Register successful!');
    }
});


// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
// router.get('/login', passport.authenticate('facebook'), {
//     successRedirect: '/',
//     failureRedirect: '/login?failedSocial=facebook'
// });

router.get('/login', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/',
        failureRedirect: '/login?failedSocial=facebook' }));

module.exports = router;
