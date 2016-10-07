var express = require('express');
var router = express.Router();
var connector = require('../modules/db.js');


router.post('/addPost', function(req, res) {
	var post = {};
	post.title = req.get('title');
	post.image1 = req.get('image1');
	post.description1 = req.get('description1');
	post.image2 = req.get('image2');
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

router.deletePost = function (req, res) {
	var accessToken = req.get('token');
	var postId = req.get('postId');
	fb.getUserDetails(accessToken, function (user) {
		db.Post.findOneAndRemove({_id: postId}, function (err, post) {
			if(!post){
				console.log("Post to delete not found!");
				res.statusCode = 500;
				return res.json({status: "Post Not Found"});
			}
			console.log("deleting post: " + post.title);
			imagesToDelete = [post.image1, post.image2];
			cloudinary.deleteImages([post.image1, post.image2]);
			return res.json({status: "OK"});
		});
	});
};


module.exports = router;
