var express = require('express');
var router = express.Router();
var connector = require('../modules/dbConnector.js');


router.post('/addPost', function(req, res) {
    console.log('add post request');
    res.send('add post successful!');
});

router.get('/allPosts', function(req, res) {
    console.log('all Posts request received');
    res.send('All posts!');
});

module.exports = router;
