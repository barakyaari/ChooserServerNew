var express = require('express');
var router = express.Router();
var connector = require('../modules/dbConnector.js');


router.get('/login', function(req, res) {
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

router.get('/logout', function(req, res) {
    var userName = req.get('username');
    console.log('logout requested by:  ' + userName);
    if(connector.userExists(userName)){
        res.send('Logout successful!');
    }
    else{
        res.send('Logout failed!');
    }
});

router.get('/register', function(req, res) {
    var userName = req.get('username');
    var password = req.get('password');
    console.log('logout requested by:  ' + userName);
    if(connector.userExists(userName)){
        res.send('user already exists!');
    }
    else{
        connector.addUser(userName, password);
        res.send('Register successful!');
    }
});

module.exports = router;
