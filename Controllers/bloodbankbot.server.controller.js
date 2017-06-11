/* eslint-disable no-console */
var bloodbankUser = require('../Models/bloodbankbot.server.model');

exports.create = function (userId, userData,cb) {
var entry = new bloodbankUser({
        _id: userId,
        Language: "",
        userInfo: userData,
      });
      entry.save(cb);
}

exports.setDonorAlertDate = function (userId, value, cb) {
  var condition = { _id: userId };
  var updateQuery = {
    $set: {
      "donor.alertDate": value,
      "donor.updatedOn": Date.now()
    }
  };
  bloodbankUser.update(condition, updateQuery, cb);
}
exports.setDonorIsActive = function (userId, value, cb) {
  var condition = { _id: userId };
  var updateQuery = {
    $set: {
      "donor.isActive": value,
      "donor.updatedOn": Date.now()
    }
  };
  bloodbankUser.update(condition, updateQuery, cb);
}

exports.setIsDonor = function (userId, value, cb) {
  var condition = { _id: userId };
  var updateQuery = {
    $set: {
      "isDonor": value,
      "isWaitingForPhoneNumber": false
    }
  };
  bloodbankUser.update(condition, updateQuery, cb);
}

exports.setIsWaitingForPhoneNumber = function (userId, value, cb) {
  var condition = { _id: userId };
  var updateQuery = {
    $set: { "isWaitingForPhoneNumber": value }
  };
  bloodbankUser.update(condition, updateQuery, cb);
}

exports.isUserExist = function (userId, cb) {
  bloodbankUser.findOne({ _id: userId }, { _id: 1 }, cb);
};


exports.getUserData = function (userId, cb) {
  bloodbankUser.findOne({ _id: userId }, { _id: 0, Language: 1, isDonor: 1, isWaitingForPhoneNumber: 1, userInfo:1 }, cb);
}

exports.getMatchedBloodDonors = function (userId, compatibleBloodTypes, location, donationType, cb) {
  var currentDate= new Date();
  currentDate.setHours(0,0,0,0);
  bloodbankUser.find({
    _id: { $ne: userId },
    "donor.isActive":{$ne:false},
    "donor.bloodType": { $in: compatibleBloodTypes },
    "donor.donationType": { $in: ["All", donationType] },
    "donor.alertDate": { $lte: currentDate },
    "donor.location": {
      $near: {
        $geometry: { type: 'Point', coordinates: [location.long, location.lat] },
        $maxDistance: 25000
      }
    }
  }, { _id: 1, Language: 1 }, cb);
}
exports.updateUserLanguage = function (userId, userLanguage, cb) {
  var condition = { _id: userId };
  var updateQuery = {
    Language: userLanguage,
    isDonor: false,
    isWaitingForPhoneNumber: false
  };
  bloodbankUser.update(condition, updateQuery, cb);
};

exports.updateDonor = function (user) {
  var currentDate= new Date();
  currentDate.setHours(0,0,0,0);
  var donorData = {
    donationType: user.donationType,
    bloodType: user.bloodType,
    location: { type: 'Point', coordinates: [user.location.long, user.location.lat] },
    address: user.location.address,
    isActive: true,
    updatedOn: Date.now(),
    alertDate: currentDate
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
