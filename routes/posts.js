var express = require('express');
var router = express.Router();
var connector = require('../modules/db.js');


router.post('/addPost', function(req, res) {
	var post = {};
	post.title = req.get('title');
	post.url1 = req.get('url1');
	post.description1 = req.get('description1');
	post.url2 = req.get('url2');
	post.description2 = req.get('description2');

	if(!post.title || !post.url1 || !post.url2){
		console.log('add post request with missing parameters');
		res.send('add post failed!');

	}

	else{
    console.log('add post request: %s', post.title);
    connector.addPost(post, user)
    res.send('add post successful!');
	}

});

router.get('/allPosts', function(req, res) {
    console.log('all Posts request received');
    res.send('All posts!');
});

module.exports = router;
