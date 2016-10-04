var connector = {};
var FB = require('fb');
fb = new FB.Facebook();

connector.isLegalToken = function (token, userId, cont) {
    fb = new FB.Facebook();
    fb.setAccessToken(token);
    console.log('Sending request to facebook');
    fb.api('me', {fields: ['id', 'name', 'email']}, function (res) {
        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            cont(false);
        }
        else {
            console.log('User: %s fb request recieved', res.name);

            if (res.id == userId) {
                console.log('Token is fine.')
                cont(true);
            }

            else {
                console.log('Illegal token recieved!');
                cont(false);
            }
        }
    });
};

connector.getUserDetails = function (token, cont) {
    fb = new FB.Facebook();
    fb.setAccessToken(token);

    var user = {};

    fb.api('me', {fields: ['id', 'first_name', 'last_name', 'email', 'gender', 'birthday']}, function (res) {

        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return null;
        }

        else {
            user.providerId = res.id;
            user.firstName = res.first_name;
            user.lastName = res.last_name;
            user.email = res.email;
            user.birthday = res.birthday;
            user.gender = res.gender;
            cont(user);
        }
    });
}

module.exports = connector;