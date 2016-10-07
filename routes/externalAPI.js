var express = require('express');
var router = express.Router();
var dbConnector = require('../modules/db.js');
var posts = require('../modules/posts.js');
var postFetcher = require('../modules/postFetcher.js');
var users = require('users.js');

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


module.exports = router;