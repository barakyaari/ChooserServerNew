var express = require('express');
var router = express.Router();
var dbConnector = require('../modules/db.js');
var posts = require('../modules/posts.js');
var postFetcher = require('../modules/posts.js');
var users = require('../modules/users');

router.get(
    '/',
    function (req, res) {
        res.send("Hello World!");
    }
);

router.get(
    '/addPost',
    function (req, res) {
        postFetcher.addPost(req, res);
    }
);

router.get(
    '/deletePost',
    function (req, res) {
        postFetcher.deletePost(req, res);
    }
);

router.get(
    '/allPosts',
    function (req, res) {
        postFetcher.getPosts(req, res);
    }
);

router.get(
    '/getmyposts',
    function (req, res) {
        postFetcher.getMyPosts(req, res);
    }
);

router.get(
    '/vote',
    function (req, res) {
        posts.vote(req, res);
    }
);

router.get(
    '/login',
    function (req, res) {
        users.login(req, res);
    }
);

router.get(
    '/getstatistics',
    function (req, res) {
        posts.getPostStatistics(req, res);
    }
);


module.exports = router;