var cloudinary = require('cloudinary');

var methods = {};

methods.deleteImages = function(imagesToDelete){
    cloudinary.config({
        cloud_name: 'chooser',
        api_key: '291124344125714',
        api_secret: 'arRkoKCCGBPwnxXmMkZXi9q9TrU'
    });
    cloudinary.api.delete_resources(imagesToDelete,
        function(result){
        console.log("Cloudinary deleted: " + result.message);
        });
};

module.exports = methods;