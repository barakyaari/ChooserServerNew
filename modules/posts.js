var fb = require('./facebookconnector.js');
var db = require('./db.js');
var cloudinary = require('./cloudinaryConnector.js');
var consts = require('./consts.js')

var methods = {};

function selectKPosts (k, posts) {
    if (!posts || posts.length == 0)
        return posts;

    var selection_span = 0;
    posts.forEach(function (post) {
        selection_span += post.push_factor;
    });

    var selection;
    var selected_posts = [];
    for (var i = 0; i < k && selection_span > 0; i++) {
        selection = parseInt(Math.random() * selection_span);

        // Will not reach out of array bounds, since selection will always reach 0
        // before j reaches out of bounds, because selection <= sum of push_factors
        for (var j = 0; selection > 0; j++)
            selection -= posts[j].push_factor;

        j--;
        selection_span -= posts[j].push_factor;

        // Put the selected post in the results list, and remove it from the array
        selected_posts.push(posts[j]);
        posts[j] = posts.pop();
    }

    selected_posts.sort(function (p1, p2) {
        return p1.push_factor - p2.push_factor;
    });

    return selected_posts;
}

methods.getPosts = function (req, res) {
    var token = req.get('token');

    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;

        db.getPosts(userId, function (err, posts) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }

            var selected_posts = selectKPosts(consts.posts_in_chunk, posts);
            res.send(selected_posts);
        });
    });
};

methods.getMyPosts = function (req, res) {
    var token = req.get('token');

    fb.getUserDetails(token, function (user) {
        var userId = user.providerId;

        db.Post.find({userId: userId}, function (err, docs) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }

            res.send(docs);
        });
    });
};

methods.getPostStatistics = function (req, res) {
    var token = req.get('token');
    fb.getUserDetails(token, function (user) {
        var postId = req.get('postId');
        db.getPostStatistics(postId, function (err, docs) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }

            var postStatistics = generateStatisticsFromVotesArray(docs);

            res.set({ 'content-type': 'application/json; charset=utf-8' });
            res.send(postStatistics);
        });
    });
};

methods.addPost = function (req, res) {
    console.log("Add post received: " + req.get('title'));

    var token = req.get('token');
    var post = {
        title: req.get('title'),
        image1: req.get('image1'),
        description1: req.get('description1'),
        image2: req.get('image2'),
        description2: req.get('description2'),
        votes1: req.get('votes1'),
        votes2: req.get('votes2'),
        usersVotes: [],
        push_factor: consts.push_factor.default,
        utcDate: Date.now()
    };

    var cont = function (providerId) {
        if (!post.title || !post.image1 || !post.image2) {
            console.log('add post request with missing parameters');
            res.send('add post failed!');
        } else {
            db.addPost(post, providerId, function (id) {
                console.log("Sent: "+id);
                return res.status(200).send(id);

            });

            console.log("Post Added");
        }
    };

    if (token == "NotMyPost")
        cont(token);
    else
        fb.getUserDetails(token, function (user) { cont(user.providerId) });
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

            db.addUserVote(userId, postId, vote, gender, age, function (err) {
                if (err) {
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

methods.report = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');
    fb.getUserDetails(accessToken, function (user) {
            var userId = user.providerId;
            var gender = user.gender;
            var birthday = user.birthday;
            var birthdayDate = parseDate(birthday);
            var age = calculateAge(birthdayDate);

            db.report(userId, postId, gender, age, function (success) {
                if (!success) {
                    console.log("Post not found!");
                    res.statusCode = 500;
                    return res.json({status: "Post Not Found"});
                }
                else {
                    console.log("Report accepted");
                    return res.json({status: "OK"});
                }
            });
        }
    );
};

methods.promote = function (req, res) {
    var accessToken = req.get('token');
    var postId = req.get('postId');

    fb.getUserDetails(accessToken, function (user) {
        db.promotePost(postId, user.providerId,
            function () {
                res.status(200).json({message: "OK"})
            }, function (err) {
                res.status(404).send({message: "Not Found"})
            });
    });
};

function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function parseDate(dateString) {
    if (dateString == null)
        return new Date();

    var parts = dateString.split('/');
    return new Date(parts[2], parts[0], parts[1]);
}

function generateStatisticsFromVotesArray(voters) {
    var vote_proto = function () {
        return {
            male: 0,
            female: 0,
            maxAge: 0,
            ageHistogram: null
        }
    };
    var votes = { 1: vote_proto(), 2: vote_proto() };

    for (var i = 0; i < voters.length; i++) {
        votes[voters[i].vote][voters[i].gender]++;
        votes[voters[i].vote]["maxAge"] = Math.max(votes[voters[i].vote]["maxAge"], voters[i].age);
    }

    votes[1]["ageHistogram"] = new Array(votes[1]["maxAge"] + 1).fill(0);
    votes[2]["ageHistogram"] = new Array(votes[2]["maxAge"] + 1).fill(0);

    for (var i = 0; i < voters.length; i++)
        votes[voters[i].vote]["ageHistogram"][voters[i].age]++;

    var postStatisticsJson = {};

    postStatisticsJson["maleVotes1"] = votes[1]["male"];
    postStatisticsJson["maleVotes2"] = votes[2]["male"];
    postStatisticsJson["femaleVotes1"] = votes[1]["female"];
    postStatisticsJson["femaleVotes2"] = votes[2]["female"];
    postStatisticsJson["ageVotes1"] = votes[1]["ageHistogram"];
    postStatisticsJson["ageVotes2"] = votes[2]["ageHistogram"];

    return postStatisticsJson;
}

module.exports = methods;