const GoogleGeoURL = 'https://maps.googleapis.com/maps/api/geocode/json'
var request = require('request');
var getUserAddress = function (userLat, userLng, callback) {
  var latlng = userLat + ', ' + userLng;
  request.get(
    {
      url: GoogleGeoURL,
      qs: {
        latlng: latlng,
        key: process.env.GOOGLE_API_KEY
      },
      json: true
    }, (err, res, body) => {
      if (callback) {
        callback(err, body);
      }
    });
};
module.exports.getUserAddress = getUserAddress;
