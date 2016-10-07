var express = require('express');
var router = express.Router();
var db = require('../modules/db');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */

router.get('/collections',function(req,res){
    res.render(db);
});


module.exports = router;
