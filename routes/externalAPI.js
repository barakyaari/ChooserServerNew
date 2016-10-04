var express = require('express');
var router = express.Router();
var dbConnector = require('../modules/db.js');
var posts = require('../modules/posts.js');
var postFetcher = require('../modules/postFetcher.js');
var users = require('../modules/users.js');

router.get(
    '/addPost',
    function (req, res) {
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
    }
);

router.get(
    '/deletePost',
    function (req, res) {
        posts.deletePost(req, res);
    }
);

router.get(
    '/getposts',
    function (req, res) {
        postFetcher.getNewPosts(req, res);
    }
);

router.get(
    '/getmyposts',
    function (req, res) {
        postFetcher.getMyPosts(req, res);
    }
);

router.get(
    '/login',
    function (req, res) {
        users.login(req, res);
    }
);

module.exports = router;