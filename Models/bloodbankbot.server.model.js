var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userInfoSchema = {
  first_name: String,
  last_name: String,
  locale: String,
  timezone: Number,
  gender: String
};

var locationSchema = {
      type: { type: String },
      coordinates: []
}

var donorSchema = {
  donationType: String,
  bloodType: String,
  address: String,
  location: locationSchema,
  isActive: { type: Boolean, default: false },
  updatedOn: { type: Date, default: Date.now },
  alertDate: { type: Date, default: Date.now }
};

var requestSchema = {
  donationType: String,
  NumberOfDonors: Number,
  phoneNumber: String,
  bloodType: String,
  address: String,
  location: locationSchema,
  isActive: { type: Boolean, default: false },
  updatedOn: { type: Date, default: Date.now }
};

var bloodBankBotSchema = new Schema({
  _id: String,
  Language: { type: String },
  userInfo: userInfoSchema,
  donor: donorSchema,
  requests: [requestSchema],
  isWaitingForPhoneNumber:{ type: Boolean, default: false },
  isDonor:{ type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now }
},
  {
    _id: false
  });
bloodBankBotSchema.index({ "donor.location.coordinates": "2dsphere" });
module.exports = mongoose.model('bloodbankUser', bloodBankBotSchema);


