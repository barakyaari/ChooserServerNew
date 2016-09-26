var connector = {};
var FB = require('fb');
fb = new FB.Facebook();

connector.isLegalToken = function (token, userId, cont) {
    fb = new FB.Facebook();
    fb.setAccessToken(token);
    console.log('Sending request to facebook');
    fb.api('me', { fields: ['id', 'name', 'email'] }, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            cont(false);
        }
        console.log('User: %s fb request recieved', res.name);

        if(res.id == userId){
            console.log('Token is fine.')
            cont(true);
        }

        else{
            console.log('Illegal token recieved!');
            cont(false);
        }
    });


}

module.exports = connector;