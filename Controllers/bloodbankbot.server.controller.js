/* eslint-disable no-console */
var path = require('path');
var bloodbankUser = require(path.resolve(__dirname, '../Models/bloodbankbot.server.model'));

exports.create = function (userId, userData) {
  bloodbankUser.findOne({ _id: userId }, { _id: 1 }, function (err, result) {
    if(err)
    console.log("error: "+ err);
    console.log("userId: "+ userId);
    console.log("result: "+ result);
    if (result!='undefined' &&result == null) {
      var entry = new bloodbankUser({
        _id: userId,
        Language: "EN",
        userInfo: userData,
      });
      entry.save(function (err) {
        if (err)
          console.log("Cant Save  error:" + err);
      });
    }
  });
};

exports.getUserLanguage = function (userId,cb) {
  bloodbankUser.findOne({ _id: userId }, { _id: 0, Language: 1 }, cb);
}

exports.getMatchedBloodDonors = function (userId, compatibleBloodTypes,location,donationType, cb) {
  bloodbankUser.find({
     _id: { $ne: userId },
    "donor.bloodType": { $in: compatibleBloodTypes },
    "donor.donationType": { $in: ["All",donationType] },
    "donor.location":{ $near: { $geometry:{type: 'Point', coordinates:[location.long, location.lat]},
                              $maxDistance:30000}
                     }
  }, { _id: 1 }, cb);
}
exports.updateUserLanguage = function (userId, userLanguage) {
  var condition = { _id: userId };
  var updateQuery = {
    Language: userLanguage
  };
  bloodbankUser.update(condition, updateQuery, function (err) {
    if (err)
      console.log("can not update");
  })
};

exports.updateDonor = function (user) {
  var donorData = {
    donationType: user.donationType,
    bloodType: user.bloodType,
    location: { type: 'Point', coordinates: [user.location.long, user.location.lat] },
    address: user.location.address,
    isActive: true,
    updatedOn: Date.now()
  };
  var condition = { _id: user.id };
  var updateQuery = {
    donor: donorData
  };
  bloodbankUser.update(condition, updateQuery, function (err) {
    if (err)
      console.log("can not update :" + err);
  })
};

exports.updateRequests = function (user) {
  var NewRequest = {
  donationType: user.donationType,
  NumberOfDonors: user.donorsNumber,
  phoneNumber: user.phoneNumber,
  bloodType: user.bloodType,
  location: { type: 'Point', coordinates: [user.location.long, user.location.lat] },
  address: user.location.address,
  isActive: true,
  updatedOn: Date.now()
};
  var condition = { _id: user.id };
  var updateQuery = {
    $push:{requests:NewRequest}
  };
  bloodbankUser.update(condition, updateQuery, function (err) {
    if (err)
      console.log("can not update :" + err);
  })
};


