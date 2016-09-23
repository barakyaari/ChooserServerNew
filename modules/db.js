const monk = require('monk');
//const mongoConnString = 'mongodb://chooser:bTrCZbmOliWFXu7TjHEpptUavLESGW516rklKahEisg0Y4FqnQraopE4UkLVFlHzN8zdYxF05CB40t6d4OCYlA==@chooser.documents.azure.com:10250/?ssl=true';
//const url = 'https://chooser.documents.azure.com:443/';
const url = 'localhost:27017'

const db = monk(url);

const userscollection = db.get('users');
const postscollection = db.get('posts');


var dbFunctions = {};

dbFunctions.userExists = function(id){
    userscollection.count({providerId: id}).then(function(count){
        return (count > 0);
    });
};

dbFunctions.addUser = function(name, id, email){
	if(dbFunctions.userExists(id)){
		console.log('user: %s exists', name);
	}

    userscollection.insert({username: name, providerId : id, email: email}).then(function(docs){
        console.log(docs);
    })
}

dbFunctions.addPost(post, user){
	postscollection.insert(
		title: post.title;
		url1: post.url1;
		description1: post.description1;
		url2: post.url1;
		description2: post.description2;
		userId: 
		)
	
}

module.exports = dbFunctions;