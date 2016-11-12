var fb = require('./facebookconnector');
var db = require('./db');

var methods = {};

methods.login = function (req, res) {
    console.log('login request. token: %s, uid:%s', req.get('token'), req.get('userId'));
    var token = req.get('token');
    var userId = req.get('userId');
    if (!fb.isLegalToken(token, userId, function(isLegal){
            if(isLegal) {
                res.statusCode = 200;
                db.updateUser(token);
                return res.json({token: "OK"});
            }
            else{
                console.log('Token is not legal');
                res.statusCode = 403;
                return res.json({token: "False"});
            }
        })){
    }
};

methods.getNumTokens = function (req, res) {
    var token = req.get('token');

    fb.getUserDetails(token, function (user) {
        db.User.findOne({ providerId: user.providerId }, { tokens: 1 }, function (err, doc) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }

            console.log('User ' + user.providerId + ' has got ' + doc.tokens + ' tokens');
            res.status(200).send(doc.tokens.toString());
        });
    });
};

module.exports = methods;