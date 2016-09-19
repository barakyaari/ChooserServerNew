var express = require('express');
var router = express.Router();
var connector = require('../modules/dbConnector.js');


router.get('/log', function(req, res) {
    var userName = req.get('username');
    var password = req.get('password');
    console.log('login requested by:  ' + userName + " " + password);
    if(connector.userExists(userName)){
        res.send('Login successful!');
    }
    else{
        res.send('Login failed!');
    }
});


module.exports = router;
