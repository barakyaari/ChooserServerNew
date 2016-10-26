var fb = require('./facebookconnector.js');
var db = require('./db.js');
var cloudinary = require('./cloudinaryConnector.js');

var methods = {};

methods.getPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;
        db.getPosts(userId, function (err, docs) {
            if (err) {
                console.error(err);
            }
            else {
                res.send(docs);
            }
        });
    })
};

methods.getMyPosts = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;
        db.Post.find({userId: userId}, function (err, docs) {
            if (err) {
                console.error(err);
            }
            else {
                res.send(docs);
            }
        })
    })
};

methods.getPostStatistics = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var postId = req.get('postId');
        db.getPostStatistics(postId, function (err, docs) {
            if (err) {
                console.error(err);
            }
            else {
                var postStatistics = generateStatisticsFromVotesArray(docs);

                res.set({ 'content-type': 'application/json; charset=utf-8' });
                res.send(postStatistics);
            }
        })
    })
};

methods.addPost = function (req, res) {
    console.log("Add post recieved: " + req.get('title'));
    var token = req.get('token');

    if (token == "NotMyPost") {
        var post = {};
        post.title = req.get('title');
        post.image1 = req.get('image1');
        post.description1 = req.get('description1');
        post.image2 = req.get('image2');
        post.description2 = req.get('description2');
        post.votes1 = req.get('votes1');
        post.votes2 = req.get('votes2');
        post.usersVotes = [];
        post.utcDate = Date.now();

        if (!post.title || !post.image1 || !post.image2) {
            console.log('add post request with missing parameters');
            res.send('add post failed!');
        }
        else {
            db.addPost(post, "NotMyPost");
            console.log("Post Added");
            return res.json({status: "OK"});
        }
    }

    else {

        fb.getUserDetails(token, function (user) {
            var token = req.get('token');
            var post = {};
            post.title = req.get('title');
            post.image1 = req.get('image1');
            post.description1 = req.get('description1');
            post.image2 = req.get('image2');
            post.description2 = req.get('description2');
            post.votes1 = req.get('votes1');
            post.votes2 = req.get('votes2');
            post.usersVotes = [];
            post.utcDate = Date.now();


            if (!post.title || !post.image1 || !post.image2) {
                console.log('add post request with missing parameters');
                res.send('add post failed!');
            }
            else {
                db.addPost(post, user.providerId);
                console.log("Post Added");
                return res.json({status: "OK"});
            }
        });
    }
};

methods.deletePost = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    fb.getUserDetails(accessToken, function (user) {
        db.Post.findOneAndRemove({_id: postId}, function (err, post) {
            if (!post) {
                console.log("Post to delete not found!");
                res.statusCode = 500;
                return res.json({status: "Post Not Found"});
            }
            console.log("deleting post: " + post.title);
            cloudinary.deleteImages([post.image1]);
            cloudinary.deleteImages([post.image2]);
            return res.json({status: "OK"});
        });
    });
};

methods.vote = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    var vote = req.get('selected');
    fb.getUserDetails(accessToken, function (user) {
            var userId = user.providerId;
            var gender = user.gender;
            var birthday = user.birthday;
            var birthdayDate = parseDate(birthday);
            var age = calculateAge(birthdayDate);

            db.addUserVote(userId, postId, vote, gender, age, function (success) {
                if (!success) {
                    console.log("Post not found!");
                    res.statusCode = 500;
                    return res.json({status: "Post Not Found"});
                }
                else {
                    console.log("Vote accepted");
                    return res.json({status: "OK"});
                }
            });
        }
    );
};

function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function parseDate(dateString) {
    var parts = dateString.split('/');
    return new Date(parts[2], parts[0], parts[1]);
}

function generateStatisticsFromVotesArray(votesArray) {
    var maleVotes1 = 0;
    var maleVotes2 = 0;
    var femaleVotes1 = 0;
    var femaleVotes2 = 0;
    var maxAgeVotes1 = 0;
    var maxAgeVotes2 = 0;
    for (var index = 0; index < votesArray.length; index++) {
        if (votesArray[index].vote == 1) {
            if (votesArray[index].gender == "female") {
                femaleVotes1++;
            }
            if (votesArray[index].gender == "male") {
                maleVotes1++;
            }
            if (votesArray[index].age > maxAgeVotes1) {
                maxAgeVotes1 = votesArray[index].age;
            }
        }
        if (votesArray[index].vote == 2) {
            if (votesArray[index].gender == "female") {
                femaleVotes2++;
            }
            if (votesArray[index].gender == "male") {
                maleVotes2++;
            }
            if (votesArray[index].age > maxAgeVotes2) {
                maxAgeVotes2 = votesArray[index].age;
            }
        }
    }

    var ageVotes1 = new Array(maxAgeVotes1 + 1).fill(0);
    var ageVotes2 = new Array(maxAgeVotes2 + 1).fill(0);

    for (var index = 0; index < votesArray.length; index++) {
        if (votesArray[index].vote == 1) {
            ageVotes1[votesArray[index].age] = ageVotes1[votesArray[index].age] + 1;
        }
        else {
            ageVotes2[votesArray[index].age] = ageVotes2[votesArray[index].age] + 1;
        }
    }
    var postStatisticsJson = {};
    postStatisticsJson["maleVotes1"] = maleVotes1;
    postStatisticsJson["maleVotes2"] = maleVotes2;
    postStatisticsJson["femaleVotes1"] = femaleVotes1;
    postStatisticsJson["femaleVotes2"] = femaleVotes2;
    postStatisticsJson["ageVotes1"] = ageVotes1;
    postStatisticsJson["ageVotes2"] = ageVotes2;

    return postStatisticsJson;
}

module.exports = methods;