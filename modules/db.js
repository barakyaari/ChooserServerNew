const monk = require('monk');
const url = 'localhost:27017/chooserdb';

const db = monk(url);

const userscollection = db.get('users');

var dbFunctions = {};

dbFunctions.userExists = function(userName){
    userscollection.count({username: userName}).then(function(count){
        return (count > 0);
    });
};

dbFunctions.addUser = function(userName, password){
    userscollection.insert({username: userName, password : password}).then(function(docs){
        console.log(docs);
    })
}

module.exports = dbFunctions;