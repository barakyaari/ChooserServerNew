var db = require('./db.js');
var connector = {};

connector.userExists = function(userName){
    return db.userExists(userName);
};

connector.addUser = function(userName, password){
    if(connector.userExists(userName)){
        return false;
    }
    else{
        db.addUser(userName, password);
    }
}


module.exports = connector;