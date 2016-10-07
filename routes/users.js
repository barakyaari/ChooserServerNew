var fb = require('./../modules/facebookconnector');
var db = require('./../modules/db');

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

module.exports = methods;